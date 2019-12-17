import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ExceptionDAO, RemoteRepositorySummary } from '../../models/Project';

export class DeleteRepositoryReportModalData extends BSModalContext {
    constructor(public deletingRepositories: RemoteRepositorySummary[], public exceptions: ExceptionDAO[]) {
        super();
    }
}

@Component({
    selector: "delete-repo-report-modal",
    templateUrl: "./deleteRepositoryReportModal.html",
    styles: ['.stacktrace { max-height: 100px; overflow: auto; white-space: pre; }']
})
export class DeleteRepositoryReportModal implements ModalComponent<DeleteRepositoryReportModalData> {
    context: DeleteRepositoryReportModalData;

    private message: string;
    private failReports: FailReport[];

    constructor(public dialog: DialogRef<DeleteRepositoryReportModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.failReports = [];
        this.context.exceptions.forEach((e: ExceptionDAO, i: number) => {
            if (e != null) { //exception not null, it means that the corresponding repository deletion has failed
                this.failReports.push({
                    repositoryID: this.context.deletingRepositories[i].repositoryId,
                    exception: e,
                });
            }
        });
        this.message = "The deletion of the following remote " + ((this.failReports.length > 1) ? "repositories" : "repository") + " has failed:";
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}

class FailReport {
    repositoryID: string;
    exception: ExceptionDAO;
}