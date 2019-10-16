import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsPropType } from '../../models/Plugins';

@Component({
    selector: 'setting-map',
    templateUrl: './settingMapRendererComponent.html',
})
export class SettingMapRendererComponent {

    @Input() types: SettingsPropType[]; //list of types, first is the key type, second is the value type
    @Input() value: {[key: string]:any};

    @Output() valueChanged = new EventEmitter<any>();

    private map: {key: string, value: any}[] = [];

    constructor() { }

    ngOnInit() {
        if (this.value == null) {
            this.add();
        } else {
            for (var key in this.value) {
                this.map.push({key: key, value: this.value[key]});
            }
        }
    }

    private add() {
        this.map.push({key: null, value: null});
    }

    private delete(index: number) {
        this.map.splice(index, 1);
        this.onModelChange();
    }

    /**
     * To call each time there is a change on the value array or on one of its member
     * (unless the change on the value array is an "add" of a null element)
     */
    private onModelChange() {
        this.value = {}; //reset value map, populate it from scratch and emit changes
        this.map.forEach(entry => {
            if (entry.key != "" && entry.value != "") {
                this.value[entry.key] = entry.value;
            }
        })
        this.valueChanged.emit(this.value);
    }


}