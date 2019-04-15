import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "list-param-editor",
    templateUrl: "./listParamEditor.html"
})
export class ListParamEditor {

    @Input() value: any[];

    @Output() valueChanged = new EventEmitter<string[]>();

    private list: string[] = [];

    constructor() { }

    ngOnInit() {
        if (this.value == null) {
            this.add();
        } else {
            this.list.push(...this.value);
        }
    }

    private add() {
        this.list.push(null);
    }

    private delete(index: number) {
        this.list.splice(index, 1);
        this.onModelChange();
    }

    /**
     * To call each time there is a change on the value array or on one of its member
     * (unless the change on the value array is an "add" of an empty entry)
     */
    private onModelChange() {
        this.value = []; //reset value list, populate it from scratch and emit changes
        this.list.forEach(v => {
            //add the value only if it is provided
            if (v != null && v.trim() != "") {
                this.value.push(v);
            }
        })
        console.log("emitting", this.value);
        this.valueChanged.emit(this.value);
    }

    /**
     * To prevent the view is re-created at every change and the focus on the input field get lost
     * https://stackoverflow.com/q/40314732/5805661
     * @param index 
     * @param obj 
     */
    private trackByIndex(index: number, obj: any): any {
        return index;
    }

}