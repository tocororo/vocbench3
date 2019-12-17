import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Project, RemoteRepositorySummary, RepositorySummary } from '../../models/Project';

export class DeleteRemoteRepoModalData extends BSModalContext {
    constructor(public project: Project, public repositories: RepositorySummary[]) {
        super();
    }
}

@Component({
    selector: "delete-remote-repo-modal",
    templateUrl: "./deleteRemoteRepoModal.html",
})
export class DeleteRemoteRepoModal implements ModalComponent<DeleteRemoteRepoModalData> {
    context: DeleteRemoteRepoModalData;

    private selectionList: boolean[];

    constructor(public dialog: DialogRef<DeleteRemoteRepoModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //initialize the selection list with all element to false (all the repositories not selected)
        this.selectionList = [];
        this.context.repositories.forEach(r => {
            this.selectionList.push(false);
        });
    }

    ok(event: Event) {
        let deletingRepos: RemoteRepositorySummary[] = [];
        for (let i = 0; i < this.selectionList.length; i++) {
            if (this.selectionList[i]) {
                deletingRepos.push(this.context.repositories[i].remoteRepoSummary);
            }
        }
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(deletingRepos);
    }

}