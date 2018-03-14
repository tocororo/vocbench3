import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import {ProjectServices} from "../services/projectServices";
import {Project, RepositorySummary} from '../models/Project';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

export class RemoteRepoModalData extends BSModalContext {
    constructor(public project: Project) {
        super();
    }
}

@Component({
    selector: "remote-repo-modal",
    templateUrl: "./remoteRepoModal.html",
})
export class RemoteRepoModal implements ModalComponent<RemoteRepoModalData> {
    context: RemoteRepoModalData;

    private pristineRepoSummaries: RepositorySummary[];
    private repoSummaries: RepositorySummary[];
    private allowBatchModify: boolean = false;

    private BATCH_ATTR: string = "batch";
    private MATCH_USERNAME_ATTR: string = "matchUsername";
    
    constructor(public dialog: DialogRef<RemoteRepoModalData>, private projectService: ProjectServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.initRepos();
    }

    private initRepos() {
        this.projectService.getRepositories(this.context.project, true).subscribe(
            repos => {
                this.pristineRepoSummaries = JSON.parse(JSON.stringify(repos)); //clone 
                this.repoSummaries = repos;
                if (this.repoSummaries.length > 1) {
                    this.allowBatchModify = true;
                    for (var i = 0; i < this.repoSummaries.length; i++) {
                        this.repoSummaries[i][this.BATCH_ATTR] = true;
                        this.repoSummaries[i][this.MATCH_USERNAME_ATTR] = true;
                    }
                }
            }
        );
    }

    private applyChange(repo: RepositorySummary) {
        if (repo[this.BATCH_ATTR]) {
            let oldUsername: string = this.pristineRepoSummaries[this.repoSummaries.indexOf(repo)].remoteRepoSummary.username;
            this.projectService.batchModifyRepostoryAccessCredentials(this.context.project, repo.remoteRepoSummary.serverURL, 
                repo[this.MATCH_USERNAME_ATTR], oldUsername, repo.remoteRepoSummary.username, repo.remoteRepoSummary.password).subscribe(
                stResp => {
                    let msg: string = "Credentials for remote repositories with serverURL " + repo.remoteRepoSummary.serverURL;
                    if (repo[this.MATCH_USERNAME_ATTR]) {
                        msg += " and username '" + oldUsername + "'";
                    }
                    msg += " have been updated";
                    this.basicModals.alert("Credentials updated", msg);
                    this.initRepos();
                }
            );
        } else { //batch false or undefined (in case of just one repoSummary)
            this.projectService.modifyRepositoryAccessCredentials(this.context.project, repo.id, 
                repo.remoteRepoSummary.username, repo.remoteRepoSummary.password).subscribe(
                stResp => {
                    this.basicModals.alert("Credentials updated", "Credentials for the '" + repo.id + 
                        "' remote repository have been updated");
                }
            );
        }
    }


    
    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}