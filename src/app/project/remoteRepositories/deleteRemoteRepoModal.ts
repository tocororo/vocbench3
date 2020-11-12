import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project, RemoteRepositorySummary, RepositorySummary } from '../../models/Project';

@Component({
    selector: "delete-remote-repo-modal",
    templateUrl: "./deleteRemoteRepoModal.html",
})
export class DeleteRemoteRepoModal {
    @Input() project: Project;
    @Input() repositories: RepositorySummary[];

    private selectionList: boolean[];

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        //initialize the selection list with all element to false (all the repositories not selected)
        this.selectionList = [];
        this.repositories.forEach(r => {
            this.selectionList.push(false);
        });
    }

    checkAll(status: boolean) {
        for (let i = 0; i < this.selectionList.length; i++) {
            this.selectionList[i] = status;
        }
    }

    ok() {
        let deletingRepos: RemoteRepositorySummary[] = [];
        for (let i = 0; i < this.selectionList.length; i++) {
            if (this.selectionList[i]) {
                deletingRepos.push(this.repositories[i].remoteRepoSummary);
            }
        }
        this.activeModal.close(deletingRepos);
    }

}