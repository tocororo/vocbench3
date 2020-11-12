import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Settings } from "../../models/Plugins";
import { CollaborationServices } from "../../services/collaborationServices";

@Component({
    selector: "create-issue-modal",
    templateUrl: "./createIssueModal.html",
})
export class CreateIssueModal {

    form: Settings;

    constructor(public activeModal: NgbActiveModal, private collaborationService: CollaborationServices) { }

    ngOnInit() {
        this.collaborationService.getIssueCreationForm().subscribe(
            form => {
                this.form = form;
            }
        )
    }

    isOkClickable(): boolean {
        return this.form && !this.form.requireConfiguration();
    }

    ok() {
        let formMap = this.form.getPropertiesAsMap();
        this.activeModal.close(formMap);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}