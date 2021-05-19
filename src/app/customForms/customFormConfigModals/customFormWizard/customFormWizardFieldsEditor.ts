import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ARTURIResource } from "src/app/models/ARTResources";
import { CustomForm, FormFieldType } from "src/app/models/CustomForms";
import { Language } from "src/app/models/LanguagesCountries";
import { DatatypesServices } from "src/app/services/datatypesServices";
import { ConstraintType, WizardField, WizardFieldLiteral, WizardFieldUri } from "./CustomFormWizard";

@Component({
    selector: "custom-form-wizard-fields-editor",
    templateUrl: "./customFormWizardFieldsEditor.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomFormWizardFieldsEditor), multi: true,
    }],
    host: { class: "vbox" }
})
export class CustomFormWizardFieldsEditor {

    fields: WizardField[];
    selectedField: WizardField;

    //selectors options
    constraintTypes: { [key: string]: ConstraintType[] } = { //map the type of the field with the allowed constraint types
        [FormFieldType.literal]: [ConstraintType.Enumeration, ConstraintType.Datatype, ConstraintType.LangString],
        [FormFieldType.uri]: [ConstraintType.Enumeration, ConstraintType.Role, ConstraintType.Range],
    };
    datatypes: ARTURIResource[];
    languages: Language[];

    constructor(private datatypeService: DatatypesServices) { }

    ngOnInit() {
        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                this.datatypes = datatypes;
            }
        )
    }

    selectField(field: WizardField) {
        this.selectedField = field;
    }

    addFieldUri() {
        this.fields.push(new WizardFieldUri("uri_field"))
        this.onModelChange();
    }
    addFieldLiteral() {
        this.fields.push(new WizardFieldLiteral("lit_field"))
        this.onModelChange();
    }

    removeField() {
        this.fields.splice(this.fields.indexOf(this.selectedField), 1);
        this.selectedField = null;
        this.onModelChange();
    }

    onLabelChange(formField: WizardField) {
        formField.featureName = CustomForm.USER_PROMPT_PREFIX + formField.label;
        this.onModelChange();
    }

    onCollMinChange() {
        if (this.selectedField.collection.min > this.selectedField.collection.max) {
            this.selectedField.collection.max = this.selectedField.collection.min
        }
        this.onModelChange();
    }
    onCollMaxChange() {
        if (this.selectedField.collection.max < this.selectedField.collection.min) {
            this.selectedField.collection.min = this.selectedField.collection.max
        }
        this.onModelChange();
    }

    onModelChange() {
        this.propagateChange(this.fields);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
     writeValue(obj: WizardField[]) {
        if (obj) {
            this.fields = obj;
        } else {
            this.fields = [];
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