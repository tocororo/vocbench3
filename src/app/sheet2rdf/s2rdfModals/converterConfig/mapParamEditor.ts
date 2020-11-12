import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "map-param-editor",
    templateUrl: "./mapParamEditor.html"
})
export class MapParamEditor {

    @Input() value: {[key: string]:any};

    @Output() valueChanged = new EventEmitter<any>();

    map: {key: string, value: any}[] = [];

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
     * (unless the change on the value array is an "add" of an empty entry)
     */
    private onModelChange() {
        this.value = {}; //reset value map, populate it from scratch and emit changes
        this.map.forEach(entry => {
            //add the entry only if the key or the value is provide
            if (entry.key != null && entry.key.trim() != "" || entry.value != null && entry.value.trim() != "") {
                this.value[entry.key] = entry.value;
            }
        })
        this.valueChanged.emit(this.value);
    }

}