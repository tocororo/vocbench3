import { Component, forwardRef } from '@angular/core';
import { Settings, SettingsProp, SettingsPropTypeConstraint } from '../../models/Plugins';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ARTURIResource, RDFResourceRolesEnum } from '../../models/ARTResources';

@Component({
    selector: 'settings-renderer',
    templateUrl: './settingsRendererComponent.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SettingsRendererComponent), multi: true,
    }]
})
export class SettingsRendererComponent {
    
    private settings: Settings;

    constructor(public sanitizer: DomSanitizer) { }

    private onModelChanged() {
        this.propagateChange(this.settings);
    }

    private updateBoolean(prop: SettingsProp, value: boolean) {
        prop.value = value;
        this.propagateChange(this.settings);
    }

    private updateIRI(prop: SettingsProp, value: ARTURIResource) {
        prop.value = value.toNT();
        this.propagateChange(this.settings);
    }

    private updateSetValue(prop: SettingsProp, value: any[]) {
        prop.value = value;
        this.propagateChange(this.settings);
    }

    private updateMapValue(prop: SettingsProp, value: any[]) {
        prop.value = value;
        this.propagateChange(this.settings);
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

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: Settings) {
        if (obj) {
            this.settings = obj;
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