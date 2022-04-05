import { Component, EventEmitter, forwardRef, Input, Output, SimpleChanges } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTLiteral } from "../../models/ARTResources";
import { ConverterContractDescription } from "../../models/Coda";
import { AnnotationName, FeatureNameEnum, FormField, FormFieldAnnotation, FormFieldType } from "../../models/CustomForms";
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
    @Input() customRange: boolean; //true if this form is for a CR (false if it is for a CC)

    @Output() hideStdResField: EventEmitter<void> = new EventEmitter(); //inform parent standard form to hide the field for the resource (e.g. URI field)

    formFields: FormField[];

    showStdFormResourceField: boolean;
    standardResourceValue: string;

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
                    "Foreign" and "Collection" can be used in combo with other annotations, so here the entry annotations are sorted in order
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
                });

                /**
                 * Handle resource placeholder
                 */
                form.forEach((field, index, self) => {
                    if (field.getPlaceholderId() == "resource") { //reserved placeholder "resource"
                        if (field.getType() == FormFieldType.uri) { //"resource uri ..."
                            //1 - resource uri(...) . => No feature path
                            if (field.getFeatureName() == null) {
                                //Probably it used a converter which doesn't require an input feature (e.g. randIdGen) => don't show any field
                                self.splice(index, 1);    
                                if (!this.customRange) { 
                                    //In CC the "standard" URI field must be omitted
                                    this.hideStdResField.emit();
                                }
                            }
                            //2 - resource uri(...) stdForm/resource . => StandardForm feature path
                            if (field.getFeatureName() == FeatureNameEnum.stdForm && field.getUserPrompt() == "resource") {
                                if (this.customRange) {
                                    //in CR, it implies to show the URI input field
                                    this.showStdFormResourceField = true;
                                } else {
                                    //in CC, it implies to not show anything since the input URI field is alrady foreseen in the standard form => remove the field
                                    self.splice(index, 1);
                                }
                            }
                            //3 - resource uri(...) userPrompt/foo . => UserPrompt feature path
                            if (field.getFeatureName() == FeatureNameEnum.userPrompt) {
                                if (!this.customRange) { 
                                    //In CC the user promt replaces the "standard" URI field
                                    this.hideStdResField.emit();
                                }
                            }
                            
                        } else { //resource used in combo with literal => invalid, remove the field from the form
                            self.splice(index, 1);
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
                    this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.CANNOT_CREATE_CUSTOM_FORM_DESCRIPTION_ERROR", params:{cfId: this.cfId}},
                        ModalType.warning, err.message);
                }
            }
        );
    }

    onFormFieldChanged(formField: FormField) {
        //when the value of a form field changes, update also the value to other form fields (if any) related to the same userPrompt
        this.formFields.forEach(f => {
            if (f != formField && f.getUserPrompt() == formField.getUserPrompt()) {
                f.value = formField.value;
            }
        })
        //then propagate changes
        this.propagateChange(this.formFields);
    }

    onStandardResourceFieldChanged() {
        this.formFields.find(f => f.getPlaceholderId() == "resource").value = this.standardResourceValue;
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