import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { CollaborationServices } from "../../services/collaborationServices";
import { Settings } from "../../models/Plugins";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "create-issue-modal",
    templateUrl: "./createIssueModal.html",
})
export class CreateIssueModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private form: Settings;

    constructor(public dialog: DialogRef<BSModalContext>, private collaborationService: CollaborationServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.collaborationService.getIssueCreationForm().subscribe(
            form => {
                this.form = form;
            }
        )
    }

    private isOkClickable(): boolean {
        return this.form && !this.form.requireConfiguration();
    }

    ok(event: Event) {
        let formMap = this.form.getPropertiesAsMap();
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(formMap);
    }

    cancel() {
        this.dialog.dismiss();
    }

}