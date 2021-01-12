import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTNode, RDFResourceRolesEnum } from '../../models/ARTResources';
import { Settings, SettingsProp, SettingsPropTypeConstraint } from '../../models/Plugins';

@Component({
    selector: 'setting-prop-renderer',
    templateUrl: './settingPropRendererComponent.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SettingPropRendererComponent), multi: true,
    }]
})
export class SettingPropRendererComponent implements ControlValueAccessor {

    @Input() disabled: boolean = false;
    
    prop: SettingsProp;

    radioName: string; //random name of the radio buttons in case of boolean prop (useful to prevent interferences between multiple boolean prop)

    translationParam: { propTypeName: string };

    constructor() { }

    ngOnInit() {
        this.radioName = "radio_" + new Date().getTime();
    }

    onModelChanged() {
        this.propagateChange(this.prop);
    }

    private updateBoolean(prop: SettingsProp, value: boolean) {
        prop.value = value;
        this.propagateChange(this.prop);
    }

    private updateValue(prop: SettingsProp, value: ARTNode) {
        if (value == null) {
            prop.value = null;
        } else {
            prop.value = value;
        }
        this.propagateChange(this.prop);
    }

    private updatePropertiesValue(prop: SettingsProp, value: Settings) {
        if (value == null) {
            prop.value = null;
        } else {
            prop.value =  value;
        }
        this.propagateChange(this.prop);
    }

    private updateSetValue(prop: SettingsProp, value: any[]) {
        prop.value = value;
        this.propagateChange(this.prop);
    }

    private updateMapValue(prop: SettingsProp, value: any[]) {
        prop.value = value;
        this.propagateChange(this.prop);
    }

    private addOptionalSettingsValue(prop: SettingsProp) {
        prop.value = prop.type.schema.clone();
        this.propagateChange(this.prop);
    }

    private deleteOptionalSettingsValue(prop: SettingsProp) {
        prop.value = null;
        this.propagateChange(this.prop);
    }


    private getIRIRoleConstraints(prop: SettingsProp): RDFResourceRolesEnum[] {
        /**
         * use a cache mechanism to avoid to recreate a roles array each time getIRIRoleConstraints is called
         * (so prevent firing change detection in resource-picker)
         */
        if (prop.type['roles'] != null) { //cached?
            return prop.type['roles'];
        }
        let roles: RDFResourceRolesEnum[] = [];
        let constr: SettingsPropTypeConstraint[] = prop.type.constraints;
        if (constr != null) {
            for (var i = 0; i < constr.length; i++) {
                if (constr[i].type.endsWith("HasRole")) {
                    roles.push(<RDFResourceRolesEnum>constr[i].value);
                }
            }
        }
        prop.type['roles'] = roles;
        return roles;
    }

    private isLanguageTaggedString(prop: SettingsProp): boolean {
        /**
         * use a cache mechanism to avoid to recreate a languageTaggedString field each time isLanguageTaggedString is called
         */
        if (prop.type['languageTaggedString'] != null) { //cached?
            return prop.type['languageTaggedString'];
        }
        let constr: SettingsPropTypeConstraint[] = prop.type.constraints;
        let isLanguageTaggedString: boolean = false;
        if (constr != null) {
            for (var i = 0; i < constr.length; i++) {
                if (constr[i].type.endsWith("LanguageTaggedString")) {
                    isLanguageTaggedString = true;
                    break;
                }
            }
        }
        prop.type['languageTaggedString'] = isLanguageTaggedString;
        return isLanguageTaggedString;
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: SettingsProp) {
        if (obj) {
            this.prop = obj;
            this.translationParam = { propTypeName: this.prop.type.name };
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

    //--------------------------------------------------

}