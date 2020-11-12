import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "import-role-modal",
    templateUrl: "./importRoleModal.html",
})
export class ImportRoleModal {
    
    roleName: string;
    private file: File;

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {}

    fileChangeEvent(file: File) {
        this.file = file;
    }
    
    ok() {
        this.activeModal.close({file: this.file, name: this.roleName});
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
    isInputValid(): boolean {
        return (this.roleName != null && this.roleName.trim() != "");
    }

}