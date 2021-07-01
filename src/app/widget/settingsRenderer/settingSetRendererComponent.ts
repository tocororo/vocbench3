import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsPropType } from '../../models/Plugins';

@Component({
    selector: 'setting-set',
    templateUrl: './settingSetRendererComponent.html',
})
export class SettingSetRendererComponent {

    @Input() type: SettingsPropType; //for sure type.name will be 'List' or 'Set', useful for retrieve typeArguments (the type of the elements of the list)
    @Input() value: any[];
    @Input() disabled: boolean = false;
    @Input() collapsable: boolean = false; // can be empty

    @Output() valueChanged = new EventEmitter<any[]>();

    argType: SettingsPropType; //type of the list/set elements

    constructor() { }

    ngOnInit() {
        this.argType = this.type.typeArguments[0];
        if (this.value == null) {
            this.value = [];
            if (!this.collapsable) {
                this.value.push(null);
            }
        }
    }

    add() {
        this.value.push(null);
        this.onModelChange();
    }

    delete(index: number) {
        this.value.splice(index, 1);        
        this.onModelChange();
    }

    onValueChange(index: number, value: any) {
        this.value[index] = value;
        this.onModelChange();
    }

    /**
     * To call each time there is a change on the value array or on one of its member
     * (unless the change on the value array is an "add" of a null element)
     */
    private onModelChange() {
        this.valueChanged.emit(this.value);
    }

    /**
     * To prevent the view is re-created at every change and the focus on the input field get lost
     * https://stackoverflow.com/q/40314732/5805661
     * @param index 
     * @param obj 
     */
    trackByIndex(index: number, obj: any): any {
        if (this.argType && this.argType.name == "IRI") {
            return obj;
        } else {
            return index;
        }
    }
}