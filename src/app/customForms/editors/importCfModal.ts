import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomForm, FormCollection } from "../../models/CustomForms";

@Component({
    selector: "import-cf-modal",
    templateUrl: "./importCfModal.html",
})
export class ImportCfModal {
    @Input() title: string;
    @Input() type: "CustomForm" | "FormCollection";
    
    shortId: string;
    prefix: string;
    private file: File;
    useImportedId: boolean = true;

    translationParam: { type: string };

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        if (this.type == "CustomForm") {
            this.prefix = CustomForm.PREFIX;
        } else {
            this.prefix = FormCollection.PREFIX;
        }
        this.translationParam = { type: this.type };
    }

    fileChangeEvent(file: File) {
        this.file = file;
    }
    
    ok() {
        let returnData: ImportCfModalReturnData;
        if (this.useImportedId) {
            returnData = {file: this.file, id: null};
        } else {
            returnData = {file: this.file, id: this.prefix + this.shortId};
        }
        this.activeModal.close(returnData);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
    isInputValid(): boolean {
        if (this.file == null) {
            return false;
        }
        if (!this.useImportedId) { //check id
            return (this.shortId != undefined && this.shortId.trim() != "");
        }
        return true;
    }

}

export class ImportCfModalReturnData {
    file: File;
    id: string;
}