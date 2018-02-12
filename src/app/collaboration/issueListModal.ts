import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { CollaborationServices } from "../services/collaborationServices";
import { Issue } from "../models/Collaboration";
import { UIUtils } from "../utils/UIUtils";
import { VBCollaboration } from "../utils/VBCollaboration";


@Component({
    selector: "issue-list-modal",
    templateUrl: "./issueListModal.html",
})
export class IssueListModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private issues: Issue[];
    private selectedIssue: Issue;

    constructor(public dialog: DialogRef<BSModalContext>, private collaborationService: CollaborationServices, 
        private vbCollaboration: VBCollaboration, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.collaborationService.listIssues().subscribe(
            issues => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.issues = issues;
            },
            (err: Error) => {
                //in case listIssues throws a ConnectException set the "working" flag to false
                if (err.name.endsWith("ConnectException")) {
                    this.basicModals.alert("Error", "Cannot retrieve the issues list. " +
                        "Connection to Collaboration System server failed." , "error", err.name + " " + err.message);
                }
                this.vbCollaboration.setWorking(false);
            }
        );
    }

    private selectIssue(issue: Issue) {
        if (this.selectedIssue == issue) {
            this.selectedIssue = null;    
        } else {
            this.selectedIssue = issue;
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedIssue);
    }

    cancel() {
        this.dialog.dismiss();
    }

}