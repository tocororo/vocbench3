import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExceptionDAO, RemoteRepositorySummary } from '../../models/Project';

@Component({
    selector: "delete-repo-report-modal",
    templateUrl: "./deleteRepositoryReportModal.html",
    styles: ['.stacktrace { max-height: 100px; overflow: auto; white-space: pre; }']
})
export class DeleteRepositoryReportModal {
    @Input() deletingRepositories: RemoteRepositorySummary[];
    @Input() exceptions: ExceptionDAO[];

    message: string;
    failReports: FailReport[];

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.failReports = [];
        this.exceptions.forEach((e: ExceptionDAO, i: number) => {
            if (e != null) { //exception not null, it means that the corresponding repository deletion has failed
                this.failReports.push({
                    repositoryID: this.deletingRepositories[i].repositoryId,
                    exception: e,
                });
            }
        });
        this.message = "The deletion of the following remote " + ((this.failReports.length > 1) ? "repositories" : "repository") + " has failed:";
    }

    ok() {
        this.activeModal.close();
    }

}

class FailReport {
    repositoryID: string;
    exception: ExceptionDAO;
}