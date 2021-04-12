import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ARTNode, RDFResourceRolesEnum } from '../../models/ARTResources';
import { Settings, SettingsPropType, SettingsPropTypeConstraint } from '../../models/Plugins';

@Component({
    selector: 'setting-value',
    templateUrl: './settingValueRendererComponent.html',
})
export class SettingValueRendererComponent {

    @Input() type: SettingsPropType;
    @Input() value: any;
    @Input() disabled: boolean = false;
    @Input() collapsable: boolean = false; // can be empty

    @Output() valueChanged = new EventEmitter<any>();

    constructor() { }

    getIRIRoleConstraints(): RDFResourceRolesEnum[] {
        /**
         * use a cache mechanism to avoid to recreate a roles array each time getIRIRoleConstraints is called
         * (so prevent firing change detection in resource-picker)
         */
        if (this.type['roles'] != null) { //cached?
            return this.type['roles'];
        }
        let roles: RDFResourceRolesEnum[] = [];
        let constr: SettingsPropTypeConstraint[] = this.type.constraints;
        if (constr != null) {
            for (let i = 0; i < constr.length; i++) {
                if (constr[i].type.endsWith("HasRole")) {
                    roles.push(<RDFResourceRolesEnum>constr[i].value);
                }
            }
        }
        this.type['roles'] = roles; //cache it
        return roles;
    }

    isLanguageTaggedString(): boolean {
        /**
         * use a cache mechanism to avoid to recreate a languageTaggedString field each time isLanguageTaggedString is called
         */
        if (this.type['languageTaggedString'] != null) { //cached?
            return this.type['languageTaggedString'];
        }
        let constr: SettingsPropTypeConstraint[] = this.type.constraints;
        let isLanguageTaggedString: boolean = false;
        if (constr != null) {
            for (let i = 0; i < constr.length; i++) {
                if (constr[i].type.endsWith("LanguageTaggedString")) {
                    isLanguageTaggedString = true;
                    break;
                }
            }
        }
        this.type['languageTaggedString'] = isLanguageTaggedString;
        return isLanguageTaggedString;
    }

    updateValue(value: ARTNode) {
        if (value == null) {
            this.value = null;
        } else {
            this.value = value.toNT();
        }
        this.onModelChange();
    }

    updatePropertiesValue(value: Settings) {
        if (value == null) {
            this.value = null;
        } else {
            this.value =  value;
        }
        this.onModelChange();
    }

    /**
     * To call each time there is a change on the value array or on one of its member
     * (unless the change on the value array is an "add" of a null element)
     */
    private onModelChange() {
        this.valueChanged.emit(this.value);
    }


}