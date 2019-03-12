import { Component, Input, SimpleChanges, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormField } from "../../models/CustomForms";
import { RDFResourceRolesEnum, ARTURIResource } from "../../models/ARTResources";
import { SKOS, OntoLex } from "../../models/Vocabulary";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CustomFormsServices } from "../../services/customFormsServices";

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "custom-form",
    templateUrl: "./customFormComponent.html",
    host: { class: "vbox" },
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomForm), multi: true,
    }]
})
export class CustomForm implements ControlValueAccessor {

    @Input() cfId: string;

    private formFields: FormField[];
    private submittedWithError: boolean = false;

    private resPickerRoles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual, RDFResourceRolesEnum.property];

    constructor(public cfService: CustomFormsServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        let ontoType: string = VBContext.getWorkingProject().getModelType();
        if (ontoType == SKOS.uri || ontoType == OntoLex.uri) {
            this.resPickerRoles.push(RDFResourceRolesEnum.concept);
            this.resPickerRoles.push(RDFResourceRolesEnum.conceptScheme);
            this.resPickerRoles.push(RDFResourceRolesEnum.skosCollection);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cfId'] && changes['cfId'].currentValue) {
            this.initFormFields();
        }
    }

    private initFormFields() {
        this.cfService.getCustomFormRepresentation(this.cfId).subscribe(
            form => {
                this.formFields = form
                /*initialize formEntries in order to adapt it to the view set checked at true to
                all formEntries. (It wouldn't be necessary for all the entries but just for those optional*/
                this.propagateChange(this.formFields);
            },
            (err: Error) => {
                if (err.name.endsWith("PRParserException")) {
                    this.basicModals.alert("Error", "Impossible to create the CustomForm (" + this.cfId
                        + "). Its description may contains error.", "error", err.message);
                }
            }
        );
    }

    /**
     * Listener to change of lang-picker used to set the language argument of a formField that
     * has coda:langString as converter
     */
    private onConverterLangChange(newLang: string, formFieldConvArgument: FormField) {
        /* setTimeout to trigger a new round of change detection avoid an exception due to changes in a lifecycle hook
        (see https://github.com/angular/angular/issues/6005#issuecomment-165911194) */
        window.setTimeout(() => {
            formFieldConvArgument['value'] = newLang
            this.propagateChange(this.formFields);
        });
    }

    /**
     * Listener on change of a formField input field. Checks if there are some other
     * formEntries with the same userPrompt and eventually updates their value
     */
    private onEntryValueChange(value: string, formField: FormField) {
        for (var i = 0; i < this.formFields.length; i++) {
            if (this.formFields[i] != formField && this.formFields[i].getUserPrompt() == formField.getUserPrompt()) {
                this.formFields[i]['value'] = value;
                this.propagateChange(this.formFields);
            }
        }
    }

    private updateIRIField(res: ARTURIResource, formField: FormField) {
        formField['value'] = res.getNominalValue();
        this.propagateChange(this.formFields);
    }

    private onModelChanged() {
        this.propagateChange(this.formFields);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: FormField[]) {
        if (obj) {
            this.formFields = obj;
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