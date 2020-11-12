import { Component, forwardRef, Input, SimpleChanges } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTLiteral } from "../../models/ARTResources";
import { ConverterContractDescription } from "../../models/Coda";
import { AnnotationName, FormField, FormFieldAnnotation } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

/**
 * Modal that allows to choose among a set of rdfResource
 */
@Component({
    selector: "custom-form",
    templateUrl: "./customFormComponent.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomFormComponent), multi: true,
    }],
    styles: [`.bottomPadding { padding-bottom: 40px; }`]
    //this, with the ngClass in the view, is necessary to prevent UI problem with the (eventual) btn dropdown in the resource-picker
})
export class CustomFormComponent implements ControlValueAccessor {

    @Input() cfId: string;
    @Input() lang: string;

    formFields: FormField[];
    private submittedWithError: boolean = false;

    constructor(public cfService: CustomFormsServices, private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cfId'] && changes['cfId'].currentValue) {
            this.initFormFields();
        }
    }

    private initFormFields() {
        this.cfService.getCustomFormRepresentation(this.cfId).subscribe(
            form => {
                /*
                    "Foreign" and "Collection" can be used in combo with other annotations so, here the entry annotations are sorted in order
                    to set at last position these annotations.
                    In this way, in the view I always take into account just the first annotation (if any) of each entry and then,
                    I look for the other annotations in order to use it in combo (according to compatibility, e.g. Foreign can be used
                    in combo with Range but not with DataOneOf)
                */
                form.forEach(f => {
                    f.getAnnotations().sort((a1: FormFieldAnnotation, a2: FormFieldAnnotation) => {
                        if (a1.name == AnnotationName.Foreign || a1.name == AnnotationName.Collection) return 1;
                        else return -1;
                    })
                })

                /*
                Handle a special case: annotation DataOneOf can be use to limit the values of a node to a given set.
                In case this annotation is used for a node that is used as coda:langString converter argument, it means that 
                the selection of the language is restricted to the values listed in the DataOneOf annotation.
                */
                form.forEach(f => {
                    //look for field generated with the coda:langString converter and with an argument that is a placeholder
                    if (f.getConverter() == ConverterContractDescription.NAMESPACE + "langString" && f.getConverterArg() != null) {
                        let langPhFormField: FormField = f.getConverterArg().ph;
                        if (langPhFormField != null) {
                            /* if the argument is a placeholder annotated with DataOneOf, set an additional 'oneOfLang' attribute in the
                            form field above in order to limit the language selection according the values assigned in the annotation.
                            This 'oneOfLang' attribute will be used in the template for the configuration of lang-picker
                            */
                            let dataOneOfAnn: FormFieldAnnotation = langPhFormField.getAnnotation(AnnotationName.DataOneOf);
                            if (dataOneOfAnn) {
                                f['oneOfLang'] = (<ARTLiteral[]>dataOneOfAnn.value).map(v => (<ARTLiteral>v).getValue());
                            }
                        }
                    }
                })

                this.formFields = form
                /*initialize formEntries in order to adapt it to the view set checked at true to
                all formEntries. (It wouldn't be necessary for all the entries but just for those optional*/
                this.propagateChange(this.formFields);
            },
            (err: Error) => {
                if (err.name.endsWith("PRParserException")) {
                    this.basicModals.alert("Error", "Impossible to create the CustomForm (" + this.cfId
                        + "). Its description may contains error.", ModalType.warning, err.message);
                }
            }
        );
    }

    private onFormFieldChanged(formField: FormField) {
        //when the value of a form field changes, update also the value to other form fields (if any) related to the same userPrompt
        this.formFields.forEach(f => {
            if (f != formField && f.getUserPrompt() == formField.getUserPrompt()) {
                f.value = formField.value;
            }
        })
        //then propagate changes
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