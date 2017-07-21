import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";

export class ImportRoleModalData extends BSModalContext {
    /**
     * @param title modal title
     */
    constructor(public title: string = "Modal Title") {
        super();
    }
}

@Component({
    selector: "import-role-modal",
    templateUrl: "./importRoleModal.html",
})
export class ImportRoleModal implements ModalComponent<ImportRoleModalData> {
    context: ImportRoleModalData;
    
    private roleName: string;
    private file: File;

    constructor(public dialog: DialogRef<ImportRoleModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {}

    fileChangeEvent(file: File) {
        this.file = file;
    }
    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close({file: this.file, name: this.roleName});
    }

    cancel() {
        this.dialog.dismiss();
    }
    
    private isInputValid(): boolean {
        return (this.roleName != null && this.roleName.trim() != "");
    }

}