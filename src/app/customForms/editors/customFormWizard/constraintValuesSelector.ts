import { Component, forwardRef, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { FormFieldType } from "src/app/models/CustomForms";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";
import { ResourcePickerConfig } from "src/app/widget/pickers/valuePicker/resourcePickerComponent";
import { ConstraintType } from "./CustomFormWizard";

@Component({
    selector: "constraint-values-selector",
    templateUrl: "./constraintValuesSelector.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ConstraintValuesSelector), multi: true,
    }],
})
export class ConstraintValuesSelector {

    /*
    Three kind of selection:
    - literal enumeration
    - resource enumeration
    - list of classes (Range/RangeList annotation)
    */

    @Input() type: FormFieldType;
    @Input() constraint: ConstraintType;

    values: ARTNode[] = [];

    constructor(private creationModals: CreationModalServices, private browsingModals: BrowsingModalServices, private sharedModals: SharedModalServices) {
    }

    addValue() {
        if (this.type == FormFieldType.literal) {
            this.addLiteral();
        } else if (this.type == FormFieldType.uri) {
            if (this.constraint == ConstraintType.Enumeration) { //select resource
                this.addResource();
            } else if (this.constraint == ConstraintType.Range) { //select class
                this.addClass();
            }
        }
    }

    deleteValue(value: ARTNode) {
        this.values.splice(this.values.indexOf(value), 1);
        this.onModelChange();
    }

    private addLiteral() {
        this.creationModals.newTypedLiteral({ key: "DATA.ACTIONS.CREATE_LITERAL" }).then(
            (literals: ARTLiteral[]) => {
                let newValue = literals[0];
                if (!this.values.some(v => v.equals(newValue))) {
                    this.values.push(newValue);
                    this.onModelChange();
                }
            },
            () => { }
        );
    }

    private addResource() {
        let config: ResourcePickerConfig = { allowRemote: true };
        this.sharedModals.pickResource({ key: "ACTIONS.SELECT_RESOURCE" }, config, true).then(
            (res: ARTResource) => {
                if (!this.values.some(v => v.equals(res))) {
                    this.values.push(res);
                    this.onModelChange();
                }
            },
            () => { }
        );
    }

    private addClass() {
        this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.SELECT_CLASS" }).then(
            (cls: ARTURIResource) => {
                if (!this.values.some(v => v.equals(cls))) {
                    this.values.push(cls);
                    this.onModelChange();
                }
            },
            () => { }
        );
    }

    onModelChange() {
        this.propagateChange(this.values);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: ARTNode[]) {
        if (obj) {
            this.values = obj;
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

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

}
