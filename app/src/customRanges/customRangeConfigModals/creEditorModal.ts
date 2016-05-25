import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {CustomRangeEntry, CustomRangeEntryType} from "../../utils/CustomRanges";
import {CustomRangeServices} from "../../services/customRangeServices";

export class CustomRangeEntryEditorModalData extends BSModalContext {
    /**
     * @param id identifier of the CustomRangeEntry to edit.
     * If not provided the modal allows to create a CRE from scratch
     * @param existingCre list of CRE id that already exist. Useful to avoid cretion of CRE with duplicate id.
     */
    constructor(public id?: string, public existingCre?: string[]) {
        super();
        this.size = "lg";
    }
}

@Component({
    selector: "cre-editor-modal",
    templateUrl: "app/src/customRanges/customRangeConfigModals/creEditorModal.html",
    providers: [CustomRangeServices]
})
export class CustomRangeEntryEditorModal implements ModalComponent<CustomRangeEntryEditorModalData> {
    context: CustomRangeEntryEditorModalData;
    
    private crePrefix: string = CustomRangeEntry.PREFIX;
    private creId: string;
    private creShortId: string;
    private name: string;
    private description: string;
    private type: CustomRangeEntryType = "graph";
    private ref: string;
    private showProperty: string;
    
    private submitted: boolean = false;
    private errorMsg: string;
    
    constructor(public dialog: DialogRef<CustomRangeEntryEditorModalData>, public crService: CustomRangeServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        if (this.context.id != undefined) { //CRE id provided, so the modal works in edit mode
            this.crService.getCustomRangeEntry(this.context.id).subscribe(
                cre => {
                    this.creId = cre.getId();
                    this.creShortId = this.creId.replace(this.crePrefix, "");
                    this.name = cre.getName();
                    this.type = cre.getType();
                    this.description = cre.getDescription();
                    this.ref = cre.getRef();
                    if (this.type == "graph") {
                        this.showProperty = cre.getShowProperty();
                    }
                }
            )
        }
        document.getElementById("toFocus").focus();
    }
    
    private isDataValid() {
        var valid = true;
        //name and ref are mandatory
        if (this.name == null || this.name.trim() == "" || this.ref == null || this.ref.trim() == "") {
            this.errorMsg = "You need to fill all the mandatory field."
            valid = false;
        }
        
        if (this.creId == null) { //check only in create mode
            if (this.creShortId == null || !this.creShortId.match(/^[a-zA-Z0-9]+$/i)) { //invalid character
                this.errorMsg = "The Custom Range Entry ID is not valid (it may be empty or contain invalid characters). Please fix it."
                valid = false;
            }
            if (this.context.existingCre.indexOf(this.crePrefix + this.creShortId) != -1) { //CRE with the same id already exists
                this.errorMsg = "A Custom Range Entry with the same ID already exists";
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
        
        var showProp: string;
        if (this.type == "graph" && this.showProperty != null && this.showProperty.trim() != "") {
            showProp = this.showProperty;
        }
        
        if (this.creId != null) { //edit mode
            this.crService.updateCustomRangeEntry(this.creId, this.name, this.description, this.ref, showProp).subscribe(
                stResp => {
                    event.stopPropagation();
                    this.dialog.close();
                }
            );
        } else { //create mode
            this.crService.createCustomRangeEntry(
                this.type, this.crePrefix + this.creShortId, this.name, this.description, this.ref, showProp).subscribe(
                    stResp => {
                        event.stopPropagation();
                        this.dialog.close();
                    }
                );
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
}