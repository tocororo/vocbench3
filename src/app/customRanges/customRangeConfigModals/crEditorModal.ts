import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {CustomRangeServices} from "../../services/customRangeServices";
import {CustomRange, CustomRangeEntry} from "../../utils/CustomRanges";
import {Observable} from 'rxjs/Observable';

export class CustomRangeEditorModalData extends BSModalContext {
    /**
     * @param id identifier of the CustomRange to edit.
     * If not provided the modal allows to create a CR from scratch
     * @param existingCr list of CR id that already exist. Useful to avoid cretion of CR with duplicate id.
     */
    constructor(public id?: string, public existingCr?: string[]) {
        super();
    }
}

@Component({
    selector: "cr-editor-modal",
    templateUrl: "./crEditorModal.html",
})
export class CustomRangeEditorModal implements ModalComponent<CustomRangeEditorModalData> {
    context: CustomRangeEditorModalData;
    
    private crPrefix: string = CustomRange.PREFIX;
    private crId: string;
    private crShortId: string; //ID of the CR without the prefix
    private crEntriesPristine: string[] = []; //keeps the pristine IDs of the entries of the given CR
            //(useful to keep track of the changes when user confirms)
    
    private crEntries: string[] = []; //ID of the entries of the given CR
    private selectedCRE: string; //CRE selected from the list of the entries of the current CR
    
    private crEntriesAll: string[] = []; //ID of all the entries available
    private selectedCREAll: string; //CRE selected from the list of all the entries
    
    private submitted: boolean = false;
    private errorMsg: string;
    
    
    constructor(public dialog: DialogRef<CustomRangeEditorModalData>, private crService: CustomRangeServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        if (this.context.id != undefined) { //CR id provided, so the modal works in edit mode
            this.crService.getCustomRange(this.context.id).subscribe(
                cr => {
                    this.crId = cr.getId();
                    this.crShortId = this.crId.replace(this.crPrefix, "");
                    var crEntriesObj: CustomRangeEntry[] = cr.getEntries();
                    //for semplicity, keep just the IDs of the CRE of the given CR
                    crEntriesObj.forEach(cre => {
                        this.crEntries.push(cre.getId());
                    });
                    this.crEntriesPristine.push(...this.crEntries);
                }
            )
        }
        this.crService.getAllCustomRangeEntries().subscribe(
            creIds => {
                this.crEntriesAll = creIds;
            }
        )
    }
    
    private selectCRE(creId: string) {
        if (this.selectedCRE == creId) {
            this.selectedCRE = null;
        } else {
            this.selectedCRE = creId;
        }
    }
    
    private selectCREAll(creId: string) {
        if (!this.isCREAlreadyInCR(creId)) {
            if (this.selectedCREAll == creId) {
                this.selectedCREAll = null;
            } else {
                this.selectedCREAll = creId;
            }
        }
    }
    
    /**
     * Adds the selected CRE from the list of all available CREs, to the list of the CRE of the current CR 
     */
    private addEntry() {
        this.crEntries.push(this.selectedCREAll);
        this.selectedCREAll = null;
    }
    
    /**
     * Removes the selected CRE from the list of the CRE of the current CR 
     */
    private removeEntry() {
        this.crEntries.splice(this.crEntries.indexOf(this.selectedCRE), 1);
        this.selectedCRE = null;
    }
    
    private isCREAlreadyInCR(creId: string) {
        return this.crEntries.indexOf(creId) != -1;
    }
    
    private isDataValid() {
        var valid = true;
        if (this.crEntries.length == 0) {
            valid = false;
            this.errorMsg = "The Custom Range Entry list is empty. Please add at least one Entry."
        }
        if (this.crId == null) { //check only in create mode
            if (this.crShortId == null && !this.crShortId.match(/^[a-zA-Z0-9]+$/i)) { //invalid character
                this.errorMsg = "The Custom Range ID is invalid (it may be empty or contain invalid characters). Please fix it."
                valid = false;
            }
            if (this.context.existingCr.indexOf(this.crPrefix + this.crShortId) != -1) { //CR with the same id already exists
                this.errorMsg = "A Custom Range with the same ID already exists";
                valid = false;
            }
        } 
        return valid;
    }
    
    ok(event) {
        this.submitted = true;
        if (!this.isDataValid()) {
            return;
        }
        if (this.crId != null) { //edit mode
            //collect the CREs to remove
            var creToRemove: string[] = [];
            for (var i = 0; i < this.crEntriesPristine.length; i++) {
                if (this.crEntries.indexOf(this.crEntriesPristine[i]) == -1) {//the CRE is not in the changed CRE list
                    creToRemove.push(this.crEntriesPristine[i]);
                }
            }
            //collect the CRE to add
            var creToAdd: string[] = [];
            for (var i = 0; i < this.crEntries.length; i++) {
                if (this.crEntriesPristine.indexOf(this.crEntries[i]) == -1) {//the CRE is not in the pristine CRE list
                    creToAdd.push(this.crEntries[i]);
                }
            }
            //collect the removeEntryFromCustomRange and addEntryToCustomRange functions 
            var changesFnArray = [];
            creToRemove.forEach(cre => {changesFnArray.push(this.crService.removeEntryFromCustomRange(this.crId, cre))});
            creToAdd.forEach(cre => {changesFnArray.push(this.crService.addEntryToCustomRange(this.crId, cre))});
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
            this.crService.createCustomRange(this.crPrefix + this.crShortId).subscribe(
                stResp => {
                    //collecting addEntryToCustomRange functions 
                    var addEntryFnArray = [];
                    addEntryFnArray = this.crEntries.map((cr) => this.crService.addEntryToCustomRange(this.crPrefix + this.crShortId, cr));
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