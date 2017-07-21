import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { Observable } from 'rxjs/Observable';
import { CustomFormsServices } from "../../services/customFormsServices";
import { FormCollection, CustomForm, CustomFormLevel } from "../../models/CustomForms";
import { ARTURIResource, ResourceUtils } from "../../models/ARTResources";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

export class FormCollEditorModalData extends BSModalContext {
    /**
     * @param id identifier of the FormCollection to edit.
     * If not provided the modal allows to create a FormCollection from scratch
     * @param existingFormColl list of FormCollection id that already exist.
     * Useful to avoid cretion of FormCollection with duplicate id.
     */
    constructor(public id: string, public existingFormColl: string[] = [], public readOnly: boolean = false) {
        super();
    }
}

@Component({
    selector: "form-coll-editor-modal",
    templateUrl: "./formCollEditorModal.html",
})
export class FormCollEditorModal implements ModalComponent<FormCollEditorModalData> {
    context: FormCollEditorModalData;

    private fcPrefix: string = FormCollection.PREFIX;
    private fcId: string;
    private fcShortId: string; //ID of the FormCollection without the prefix

    private forms: CustomForm[] = []; //forms of the given FormCollection
    private selectedForm: CustomForm; //CustomForm selected from the list of the forms of the current FormCollection

    private formsAvailable: CustomForm[] = []; //ID of all the forms available
    private selectedFormAvailable: CustomForm; //CustomForm selected from the list of all the forms

    private suggestions: ARTURIResource[] = []; //classes/properties suggested for the collection
    private selectedSuggestion: ARTURIResource;

    //used to check for changes after confirm
    // private formsPristine: CustomForm[] = []; //keeps the pristine forms of the given FormCollection
    // private suggestionsPristine: ARTURIResource[] = []; //keeps the pristine suggestions of the given FormCollection

    private submitted: boolean = false;
    private errorMsg: string;


    constructor(public dialog: DialogRef<FormCollEditorModalData>, private cfService: CustomFormsServices, 
        private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.id != undefined) { //CR id provided, so the modal works in edit mode
            this.cfService.getFormCollection(this.context.id).subscribe(
                fc => {
                    this.fcId = fc.getId();
                    this.fcShortId = this.fcId.replace(this.fcPrefix, "");
                    this.forms = fc.getForms();
                    // this.formsPristine.push(...this.forms);
                    this.suggestions = fc.getSuggestions();
                    // this.suggestionsPristine.push(...this.suggestions);
                    //get CF available
                    this.cfService.getAllCustomForms().subscribe(
                        cForms => {
                            for (var i = 0; i < cForms.length; i++) {
                                //add the CF in the available list only if it is not in the CF of the FormCollection
                                let inColl: boolean = false;
                                for (var j = 0; j < this.forms.length; j++) {
                                    if (this.forms[j].getId() == cForms[i].getId()) {
                                        inColl = true;
                                        break;
                                    }
                                }

                                if (!inColl) { //add only if not already in form of collection
                                    this.formsAvailable.push(cForms[i]);
                                }
                            }
                        },
                        err => { this.dialog.dismiss() }
                    );

                },
                err => { this.dialog.dismiss() }
            );
        } else {
            this.cfService.getAllCustomForms().subscribe(
                cForms => {
                    this.formsAvailable = cForms;
                },
                err => { this.dialog.dismiss() }
            );
        }
    }

    private selectForm(form: CustomForm) {
        if (this.context.readOnly) {
            return;
        }
        if (this.selectedForm == form) {
            this.selectedForm = null;
        } else {
            this.selectedForm = form;
        }
    }

    private selectFormAvailable(form: CustomForm) {
        if (this.context.readOnly) {
            return;
        } else {
            if (this.selectedFormAvailable == form) {
                this.selectedFormAvailable = null;
            } else {
                this.selectedFormAvailable = form;
            }
        }
    }

    /**
     * Adds the selected CF from the list of all available CFs, to the list of the CF of the current FC 
     */
    private addForm() {
        this.forms.push(this.selectedFormAvailable); //add to collection
        this.formsAvailable.splice(this.formsAvailable.indexOf(this.selectedFormAvailable), 1); //remove from available
        this.selectedFormAvailable = null;
    }

    /**
     * Removes the selected CRE from the list of the CRE of the current CR 
     */
    private removeForm() {
        this.forms.splice(this.forms.indexOf(this.selectedForm), 1); //remove from collection
        this.formsAvailable.push(this.selectedForm); //add to available
        this.selectedForm = null;
    }

    private isFormAlreadyInCollection(form: CustomForm) {
        for (var i = 0; i < this.forms.length; i++) {
            this.forms[i].getId() == form.getId();
            return true;
        }
        return false;
    }

    /**
     * Suggestions handler
     */

    private selectSuggestion(suggestion: ARTURIResource) {
        if (this.context.readOnly) {
            return;
        }
        if (this.selectedSuggestion == suggestion) {
            this.selectedSuggestion = null;
        } else {
            this.selectedSuggestion = suggestion;
        }
    }

    private addSuggestionClass() {
        this.browsingModals.browseClassTree("Add class as suggestion").then(
            cls => {
                if (!ResourceUtils.containsNode(this.suggestions, cls)) {
                    this.suggestions.push(cls);
                }
            }
        )
    }

    private addSuggestionProperty() {
        this.browsingModals.browsePropertyTree("Add property as suggestion").then(
            prop => {
                if (!ResourceUtils.containsNode(this.suggestions, prop)) {
                    this.suggestions.push(prop);
                }
            }
        )
    }

    private removeSuggestion() {
        this.suggestions.splice(this.suggestions.indexOf(this.selectedSuggestion), 1);
    }



    private isDataValid() {
        var valid = true;
        if (this.forms.length == 0) {
            valid = false;
            this.errorMsg = "The FormCollection list is empty. Please add at least one CustomForm."
        }
        if (this.fcId == null) { //check only in create mode
            if (this.fcShortId == null) {
                valid = false;
                this.errorMsg = "The FormCollection ID is empty"
            } else if (!this.fcShortId.match(/^[a-zA-Z0-9]+$/i)) { //invalid character
                this.errorMsg = "The FormCollection ID is invalid (it may be empty or contain invalid characters). Please fix it."
                valid = false;
            }
            if (this.context.existingFormColl.indexOf(this.fcPrefix + this.fcShortId) != -1) { //FC with the same id already exists
                this.errorMsg = "A FormCollection with the same ID already exists";
                valid = false;
            }
        }
        return valid;
    }

    ok(event: Event) {
        this.submitted = true;
        if (!this.isDataValid()) {
            return;
        }
        let formIds: string[] = [];
        this.forms.forEach(f => formIds.push(f.getId()));
        if (this.fcId != null) { //edit mode
            this.cfService.updateFromCollection(this.fcId, formIds, this.suggestions).subscribe(
                stResp => {
                    event.stopPropagation();
                    this.dialog.close();
                }
            );
        } else { //create mode
            this.cfService.createFormCollection(this.fcPrefix + this.fcShortId).subscribe(
                stResp => {
                    this.cfService.updateFromCollection(this.fcPrefix + this.fcShortId, formIds, this.suggestions).subscribe(
                        stResp => {
                            event.stopPropagation();
                            this.dialog.close();
                        }
                    );
                }
            )
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
}