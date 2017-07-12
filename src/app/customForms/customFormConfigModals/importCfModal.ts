import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {CustomForm, FormCollection} from "../../models/CustomForms";

export class ImportCfModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param prefix prefix to show to the left of the input field
     * @param label label of the input field
     * @param value the default value to show in input field
     */
    constructor(
        public title: string = "Modal Title",
        public type: "CustomForm" | "FormCollection",
    ) {
        super();
    }
}

@Component({
    selector: "import-cf-modal",
    templateUrl: "./importCfModal.html",
})
export class ImportCfModal implements ModalComponent<ImportCfModalData> {
    context: ImportCfModalData;
    
    private shortId: string;
    private prefix: string;
    private file: File;
    private useImportedId: boolean = true;

    constructor(public dialog: DialogRef<ImportCfModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.type == "CustomForm") {
            this.prefix = CustomForm.PREFIX;
        } else {
            this.prefix = FormCollection.PREFIX;
        }
    }

    fileChangeEvent(file: File) {
        this.file = file;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.useImportedId) {
            this.dialog.close({file: this.file, id: null});
        } else {
            this.dialog.close({file: this.file, id: this.prefix + this.shortId});
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private isInputValid(): boolean {
        if (this.file == null) {
            return false;
        }
        if (!this.useImportedId) { //check id
            return (this.shortId != undefined && this.shortId.trim() != "");
        }
        return true;
    }

}