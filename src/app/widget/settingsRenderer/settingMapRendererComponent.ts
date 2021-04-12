import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Settings, SettingsPropType } from '../../models/Plugins';

@Component({
    selector: 'setting-map',
    templateUrl: './settingMapRendererComponent.html',
})
export class SettingMapRendererComponent {

    @Input() types: SettingsPropType[]; //list of types, first is the key type, second is the value type
    @Input() value: {[key: string]:any};
    @Input() disabled: boolean = false;

    @Output() valueChanged = new EventEmitter<any>();

    map: {key: string, value: any}[] = [];

    constructor() { }

    ngOnInit() {
        // if (this.value == null || this.value == {}) {
        if (this.value == null) {
            this.add();
        } else {
            for (let key in this.value) {
                this.map.push({key: key, value: this.value[key]});
            }
        }
    }

    add() {
        this.map.push({key: null, value: null});
    }

    delete(index: number) {
        this.map.splice(index, 1);
        this.onModelChange();
    }

    onValueChange(index: number, value: any) {
        this.map[index].value = value;
        this.onModelChange();
    }

    /**
     * To call each time there is a change on the value of a map entry
     * (unless the change on map is an "add" of a null element)
     */
    private onModelChange() {
        this.value = {}; //reset value map, populate it from scratch and emit changes
        this.map.forEach(entry => {
            if (entry.key != "" && entry.value != "") {
                if (entry.value instanceof Settings) { //nested
                    this.value[entry.key] = entry.value.getPropertiesAsMap();
                } else {
                    this.value[entry.key] = entry.value;
                }
            }
        })
        if (Object.keys(this.value).length == 0) { //if empty map, emit null value
            this.value = null;
        }
        this.valueChanged.emit(this.value);
    }

}