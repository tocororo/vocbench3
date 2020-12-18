import { ARTURIResource } from "../../../../models/ARTResources";
import { CustomForm, CustomFormUtils, FormField } from "../../../../models/CustomForms";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { BasicModalServices } from "../../basicModal/basicModalServices";
import { BrowsingModalServices } from "../../browsingModal/browsingModalServices";
import { ModalType } from '../../Modals';

export abstract class AbstractCustomConstructorModal {
    resourceClass: ARTURIResource; //type of the resource that the custom constructor is creating
    customFormId: string; //custom form id that is used to create the resource
    //custom form
    formFields: FormField[] = [];

    /**
     * CONSTRUCTOR
     */
    protected cfService: CustomFormsServices;
    protected basicModals: BasicModalServices;
    protected browsingModals: BrowsingModalServices;
    constructor(cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices) {
        this.cfService = cfService;
        this.basicModals = basicModals;
        this.browsingModals = browsingModals;
    }

    /**
     * METHODS
     */

    /**
     * Listener on click on the refine class button: should open a modal that allows to browse the class tree
     * rooted on the class that the custom constructor modal is creating.
     */
    abstract changeClass(): void;

    /**
     * Called by changeClass, that just invoke this method passing the root class
     */
    changeClassWithRoot(rootClass: ARTURIResource) {
        this.browsingModals.browseClassTree("Change class", [rootClass]).then(
            (selectedClass: any) => {
                if ((<ARTURIResource>selectedClass).getURI() != this.resourceClass.getURI()) {
                    this.resourceClass = selectedClass;
                    this.selectCustomForm();
                }
            },
            () => { }
        );
    }

    /**
     * Get the custom forms available for the resource's class and update the cfId.
     * In case multiple cf are available, ask to the user which one to select
     */
    selectCustomForm() {
        this.cfService.getCustomConstructors(this.resourceClass).subscribe(
            customForms => {
                if (customForms.length == 0) { //empty form collection
                    this.customFormId = null;
                    this.formFields = [];
                } else if (customForms.length == 1) {
                    this.customFormId = customForms[0].getId();
                } else { //(forms.length > 1) //let user choose
                    return this.basicModals.selectCustomForm({ key: "ACTIONS.SELECT_CONSTRUCTOR" }, customForms).then(
                        (selectedCF: any) => {
                            this.customFormId = (<CustomForm>selectedCF).getId();
                        },
                        () => { }
                    );
                }
            }
        );
    }

    /**
     * Collect the data in the custom form fields and return them as json map object
     */
    collectCustomFormData(): any {
        var entryMap: {[key: string]: any} = {}; //{key: svalue, key: value,...}
        for (var i = 0; i < this.formFields.length; i++) {
            let entry = this.formFields[i];
            let value: any = entry['value'];
            let empty: boolean = false;
            try { if (value.trim() == "") { empty = true; } } catch (err) {} //entry value could be not a string, so the check is in a try-catch
            if (!empty) {
                //add the entry only if not already in
                var alreadyIn: boolean = false;
                for (var key in entryMap) {
                    if (key == entry.getUserPrompt()) {
                        alreadyIn = true;
                        break;
                    }
                }
                if (!alreadyIn) {
                    entryMap[entry.getUserPrompt()] = value;
                }
            }
        }
        return entryMap;
    }

    onEnter() {
        if (this.isInputValid()) {
            this.ok();
        }
    }

    /**
     * Check if standard form data and custom form data are valid. Useful to disable OK button if
     * tha data are not valid or incomplete
     */
    isInputValid(): boolean {
        var standardFormValid: boolean = this.isStandardFormDataValid();
        var customFormValid: boolean = this.isCustomFormDataValid();
        return (standardFormValid && customFormValid);
    }

    /**
     * Check if data in the standard form fields are valid.
     * This needs to be abstract since the standard form fields changes from modal to modal.
     */
    abstract isStandardFormDataValid(): boolean;

    /**
     * Check if data in the custom form fields are valid (if the required are not null)
     */
    isCustomFormDataValid(): boolean {
        return CustomFormUtils.isFormValid(this.formFields);
    }

    ok() {
        let constraintViolatedMsg = CustomFormUtils.isFormConstraintOk(this.formFields);
        if (constraintViolatedMsg != null) {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, constraintViolatedMsg, ModalType.warning);
            return;
        }
        this.okImpl();
    }

    abstract okImpl(): void;

    abstract cancel(): void;

}