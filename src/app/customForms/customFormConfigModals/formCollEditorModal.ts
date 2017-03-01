import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {CustomFormsServices} from "../../services/customFormsServices";
import {FormCollection, CustomForm} from "../../models/CustomForms";
import {Observable} from 'rxjs/Observable';

export class FormCollEditorModalData extends BSModalContext {
    /**
     * @param id identifier of the FormCollection to edit.
     * If not provided the modal allows to create a FormCollection from scratch
     * @param existingFormColl list of FormCollection id that already exist.
     * Useful to avoid cretion of FormCollection with duplicate id.
     */
    constructor(public id?: string, public existingFormColl?: string[]) {
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
    private formsPristine: string[] = []; //keeps the pristine IDs of the forms of the given FormCollection
            //(useful to keep track of the changes when user confirms)
    
    private forms: string[] = []; //ID of the forms of the given FormCollection
    private selectedForm: string; //CustomForm selected from the list of the forms of the current FormCollection
    
    private formsAll: string[] = []; //ID of all the forms available
    private selectedFormAll: string; //CustomForm selected from the list of all the forms
    
    private submitted: boolean = false;
    private errorMsg: string;
    
    
    constructor(public dialog: DialogRef<FormCollEditorModalData>, private cfService: CustomFormsServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        if (this.context.id != undefined) { //CR id provided, so the modal works in edit mode
            this.cfService.getFormCollection(this.context.id).subscribe(
                cr => {
                    this.fcId = cr.getId();
                    this.fcShortId = this.fcId.replace(this.fcPrefix, "");
                    var crEntriesObj: CustomForm[] = cr.getForms();
                    //for semplicity, keep just the IDs of the CRE of the given CR
                    crEntriesObj.forEach(cre => {
                        this.forms.push(cre.getId());
                    });
                    this.formsPristine.push(...this.forms);
                }
            )
        }
        this.cfService.getAllCustomForms().subscribe(
            creIds => {
                this.formsAll = creIds;
            }
        )
    }
    
    private selectForm(formId: string) {
        if (this.selectedForm == formId) {
            this.selectedForm = null;
        } else {
            this.selectedForm = formId;
        }
    }
    
    private selectFormAll(formId: string) {
        if (!this.isFormAlreadyInCollection(formId)) {
            if (this.selectedFormAll == formId) {
                this.selectedFormAll = null;
            } else {
                this.selectedFormAll = formId;
            }
        }
    }
    
    /**
     * Adds the selected CRE from the list of all available CREs, to the list of the CRE of the current CR 
     */
    private addForm() {
        this.forms.push(this.selectedFormAll);
        this.selectedFormAll = null;
    }
    
    /**
     * Removes the selected CRE from the list of the CRE of the current CR 
     */
    private removeForm() {
        this.forms.splice(this.forms.indexOf(this.selectedForm), 1);
        this.selectedForm = null;
    }
    
    private isFormAlreadyInCollection(formId: string) {
        return this.forms.indexOf(formId) != -1;
    }
    
    private isDataValid() {
        var valid = true;
        if (this.forms.length == 0) {
            valid = false;
            this.errorMsg = "The FormCollection list is empty. Please add at least one CustomForm."
        }
        if (this.fcId == null) { //check only in create mode
            if (this.fcShortId == null && !this.fcShortId.match(/^[a-zA-Z0-9]+$/i)) { //invalid character
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
        if (this.fcId != null) { //edit mode
            //collect the CustomForm to remove
            var formsToRemove: string[] = [];
            for (var i = 0; i < this.formsPristine.length; i++) {
                if (this.forms.indexOf(this.formsPristine[i]) == -1) {//the CustomForm is not in the changed CustomForm list
                    formsToRemove.push(this.formsPristine[i]);
                }
            }
            //collect the CustomForm to add
            var formsToAdd: string[] = [];
            for (var i = 0; i < this.forms.length; i++) {
                if (this.formsPristine.indexOf(this.forms[i]) == -1) {//the CustomForm is not in the pristine CustomForm list
                    formsToAdd.push(this.forms[i]);
                }
            }
            //collect the removeFormFromCollection and addFormToCollection functions 
            var changesFnArray: any[] = [];
            formsToRemove.forEach(cForm => {changesFnArray.push(this.cfService.removeFormFromCollection(this.fcId, cForm))});
            formsToAdd.forEach(cForm => {changesFnArray.push(this.cfService.addFormToCollection(this.fcId, cForm))});
            if (changesFnArray.length == 0) { //no changes
                event.stopPropagation();
                this.dialog.close();
            } else { //changes to do...apply then close
                //call the collected functions and subscribe when all are completed
                Observable.forkJoin(changesFnArray).subscribe(
                    res => {
                        event.stopPropagation();
                        this.dialog.close();
                    }
                );
            }
        } else { //create mode
            this.cfService.createFormCollection(this.fcPrefix + this.fcShortId).subscribe(
                stResp => {
                    //collecting addFormToCollection functions 
                    var addEntryFnArray: any[] = [];
                    addEntryFnArray = this.forms.map((cForm) => this.cfService.addFormToCollection(this.fcPrefix + this.fcShortId, cForm));
                    //call the collected functions and subscribe when all are completed
                    Observable.forkJoin(addEntryFnArray).subscribe(
                        res => {
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