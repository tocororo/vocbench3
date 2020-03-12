import { Component, forwardRef, Input, SimpleChanges } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTNode, ARTLiteral } from "../../models/ARTResources";
import { AnnotationName, FormField, FormFieldAnnotation } from "../../models/CustomForms";
import { ConverterContractDescription } from "../../models/Coda";
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

    private formFields: FormField[];
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
                It is supposed that each form field has just one annotation. 
                Only "Foreign" can be used in combo with other annotations (semantically valid only with Range, RangeList and Role), 
                so, here the entry annotations are sorted in order to set at last position the Foreign annotation.
                In this way, in the view I always take into account just the first annotation (if any) of each entry and then,
                only when the first one is among Range, RangeList or Role, I look for the Foreign annotation in order to use it in combo
                */
                form.forEach(f => {
                    f.getAnnotations().sort((a1: FormFieldAnnotation, a2: FormFieldAnnotation) => {
                        if (a1.name == AnnotationName.Foreign) return 1;
                        else return -1;
                    })
                })

                /*
                Hanldle a special case: annotation DataOneOf can be use to limit the values of a node to a given set.
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
                                f['oneOfLang'] = dataOneOfAnn.values.map(v => (<ARTLiteral>v).getValue());
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
                        + "). Its description may contains error.", "error", err.message);
                }
            }
        );
    }

    /**
     * Listener to change of lang-picker used to set the language argument of a formField that
     * has coda:langString as converter
     */
    private onConverterLangChange(newLang: string, formFieldConvArgumentPh: FormField) {
        /* setTimeout to trigger a new round of change detection avoid an exception due to changes in a lifecycle hook
        (see https://github.com/angular/angular/issues/6005#issuecomment-165911194) */
        window.setTimeout(() => {
            formFieldConvArgumentPh['value'] = newLang
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

    private updateNodeField(res: ARTNode, formField: FormField) {
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