import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { CustomForm, EditorMode, FormCollection } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "form-coll-editor-modal",
    templateUrl: "./formCollEditorModal.html",
})
export class FormCollEditorModal {
    @Input() id: string;
    @Input() existingFormColl: string[] = [];
    @Input() readOnly: boolean;

    mode: EditorMode;

    namespaceLocked: boolean = true;

    private fcPrefix: string = FormCollection.PREFIX;
    private fcId: string;
    private fcShortId: string; //ID of the FormCollection without the prefix

    forms: CustomForm[] = []; //forms of the given FormCollection
    selectedForm: CustomForm; //CustomForm selected from the list of the forms of the current FormCollection

    formsAvailable: CustomForm[] = []; //ID of all the forms available
    selectedFormAvailable: CustomForm; //CustomForm selected from the list of all the forms

    suggestions: ARTURIResource[] = []; //classes/properties suggested for the collection
    selectedSuggestion: ARTURIResource;

    //used to check for changes after confirm
    // private formsPristine: CustomForm[] = []; //keeps the pristine forms of the given FormCollection
    // private suggestionsPristine: ARTURIResource[] = []; //keeps the pristine suggestions of the given FormCollection

    submitted: boolean = false;
    errorMsg: string;


    constructor(public activeModal: NgbActiveModal, private cfService: CustomFormsServices, private browsingModals: BrowsingModalServices) { }

    ngOnInit() {
        if (this.id != undefined) { //CR id provided, so the modal works in edit mode
            this.mode = EditorMode.edit;
            this.cfService.getFormCollection(this.id).subscribe(
                fc => {
                    this.fcId = fc.getId();
                    this.fcPrefix = this.fcId.substring(0, this.fcId.lastIndexOf(".") + 1);
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
                        err => { this.activeModal.dismiss() }
                    );

                },
                err => { this.activeModal.dismiss() }
            );
        } else {
            this.mode = EditorMode.create;
            this.cfService.getAllCustomForms().subscribe(
                cForms => {
                    this.formsAvailable = cForms;
                },
                err => { this.activeModal.dismiss() }
            );
        }
    }

    //========= ID Namespace-lock HANDLER =========
    
    unlockNamespace() {
        this.namespaceLocked = !this.namespaceLocked;
        if (this.namespaceLocked) { //from free id to locked namespace
            this.fromIdToPrefixAndShortId();
        } else { //from locked namespace to free id
            this.fcId = this.fcPrefix + (this.fcShortId != null ? this.fcShortId : "");
        }
    }

    private fromIdToPrefixAndShortId() {
        let separatorIdx: number = this.fcId.lastIndexOf(".");
        if (separatorIdx > 0) {
            this.fcPrefix = this.fcId.substring(0, separatorIdx + 1);
            this.fcShortId = this.fcId.substring(separatorIdx + 1);
        } else {  //no . in the id => restore the original id
            this.fcShortId = null;
        }
    }

    //=========================================

    selectForm(form: CustomForm) {
        if (this.readOnly) {
            return;
        }
        if (this.selectedForm == form) {
            this.selectedForm = null;
        } else {
            this.selectedForm = form;
        }
    }

    selectFormAvailable(form: CustomForm) {
        if (this.readOnly) {
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
    addForm() {
        this.forms.push(this.selectedFormAvailable); //add to collection
        this.formsAvailable.splice(this.formsAvailable.indexOf(this.selectedFormAvailable), 1); //remove from available
        this.selectedFormAvailable = null;
    }

    /**
     * Removes the selected CRE from the list of the CRE of the current CR 
     */
    removeForm() {
        this.forms.splice(this.forms.indexOf(this.selectedForm), 1); //remove from collection
        this.formsAvailable.push(this.selectedForm); //add to available
        this.selectedForm = null;
    }

    isFormAlreadyInCollection(form: CustomForm) {
        for (var i = 0; i < this.forms.length; i++) {
            this.forms[i].getId() == form.getId();
            return true;
        }
        return false;
    }

    /**
     * Suggestions handler
     */

    selectSuggestion(suggestion: ARTURIResource) {
        if (this.readOnly) {
            return;
        }
        if (this.selectedSuggestion == suggestion) {
            this.selectedSuggestion = null;
        } else {
            this.selectedSuggestion = suggestion;
        }
    }

    addSuggestionClass() {
        this.browsingModals.browseClassTree({key:"CUSTOM_FORMS.ACTIONS.ADD_CLASS_AS_SUGGESTION"}).then(
            cls => {
                if (!ResourceUtils.containsNode(this.suggestions, cls)) {
                    this.suggestions.push(cls);
                }
            }
        )
    }

    addSuggestionProperty() {
        this.browsingModals.browsePropertyTree({key:"CUSTOM_FORMS.ACTIONS.ADD_PROPERTY_AS_SUGGESTION"}).then(
            prop => {
                if (!ResourceUtils.containsNode(this.suggestions, prop)) {
                    this.suggestions.push(prop);
                }
            }
        )
    }

    removeSuggestion() {
        this.suggestions.splice(this.suggestions.indexOf(this.selectedSuggestion), 1);
    }



    isDataValid() {
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
            if (this.existingFormColl.indexOf(this.fcPrefix + this.fcShortId) != -1) { //FC with the same id already exists
                this.errorMsg = "A FormCollection with the same ID already exists";
                valid = false;
            }
        }
        return valid;
    }

    ok() {
        this.submitted = true;
        if (!this.isDataValid()) {
            return;
        }
        let formIds: string[] = [];
        this.forms.forEach(f => formIds.push(f.getId()));
        if (this.mode == EditorMode.edit) {
            this.cfService.updateFromCollection(this.fcId, formIds, this.suggestions).subscribe(
                stResp => {
                    this.activeModal.close();
                }
            );
        } else { //create mode
            this.cfService.createFormCollection(this.fcPrefix + this.fcShortId).subscribe(
                stResp => {
                    this.cfService.updateFromCollection(this.fcPrefix + this.fcShortId, formIds, this.suggestions).subscribe(
                        stResp => {
                            this.activeModal.close();
                        }
                    );
                }
            )
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }
}