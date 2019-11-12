import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { RepositoriesServices } from "../../../../services/repositoriesServices";
import { RemoteRepositoryAccessConfig, Repository } from "../../../../models/Project";

export class RemoteRepoSelectionModalData extends BSModalContext {
    /**
     * @param title
     * @param configuration 
     */
    constructor(public title: string, public repoConfig: RemoteRepositoryAccessConfig) {
        super();
    }
}

@Component({
    selector: "remote-repo-select-modal",
    templateUrl: "./remoteRepoSelectionModal.html",
})
export class RemoteRepoSelectionModal implements ModalComponent<RemoteRepoSelectionModalData> {
    context: RemoteRepoSelectionModalData;

    private repoList: Repository[];
    private selectedRepo: Repository;

    constructor(public dialog: DialogRef<RemoteRepoSelectionModalData>, private repoService: RepositoriesServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.repoService.getRemoteRepositories(
            this.context.repoConfig.serverURL, this.context.repoConfig.username, this.context.repoConfig.password).subscribe(
            repositories => {
                this.repoList = repositories;
                this.repoList.sort((r1: Repository, r2: Repository) => {
                    return r1.id.toLocaleLowerCase().localeCompare(r2.id.toLocaleLowerCase());
                });
            }
        );
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedRepo);
    }

    cancel() {
        this.dialog.dismiss();
    }

}