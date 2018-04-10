import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RDFResourceRolesEnum, ARTURIResource } from '../../models/ARTResources';
import { SettingsPropType, SettingsPropTypeConstraint } from '../../models/Plugins';

@Component({
    selector: 'setting-set',
    templateUrl: './settingSetRendererComponent.html',
})
export class SettingSetRendererComponent {

    @Input() types: SettingsPropType[]; //list of types (actually it is handled only the first type)
    @Input() value: any[];

    @Output() valueChanged = new EventEmitter<any[]>();

    constructor() { }

    ngOnInit() {
        if (this.value == null) {
            this.value = [];
            this.value.push(null);
        }
    }

    private add() {
        this.value.push(null);
    }

    private delete(value: any) {
        this.value.splice(this.value.indexOf(value), 1);
        this.onModelChange();
    }

    private getIRIRoleConstraints(): RDFResourceRolesEnum[] {
        /**
         * use a cache mechanism to avoid to recreate a roles array each time getIRIRoleConstraints is called
         * (so prevent firing change detection in resource-picker)
         */
        if (this.types[0]['roles'] != null) { //cached?
            return this.types[0]['roles'];
        }
        let roles: RDFResourceRolesEnum[] = [];
        let constr: SettingsPropTypeConstraint[] = this.types[0].constraints;
        if (constr != null) {
            for (var i = 0; i < constr.length; i++) {
                if (constr[i].type.endsWith("HasRole")) {
                    roles.push(<RDFResourceRolesEnum>constr[i].value);
                }
            }
        }
        this.types[0]['roles'] = roles; //cache it
        return roles;
    }

    private updateIRI(index: number, value: ARTURIResource) {
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
    private trackByIndex(index: number, obj: any): any {
        if (this.types && this.types[0].name == "IRI") {
            return obj;
        } else 
        return index;
    }
}