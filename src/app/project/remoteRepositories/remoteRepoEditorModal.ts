import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project, RepositorySummary } from '../../models/Project';
import { ProjectServices } from "../../services/projectServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "remote-repo-editor-modal",
    templateUrl: "./remoteRepoEditorModal.html",
})
export class RemoteRepoEditorModal {
    @Input() project: Project

    private pristineRepoSummaries: RepositorySummary[];
    repoSummaries: RepositorySummary[];
    private allowBatchModify: boolean = false;

    private BATCH_ATTR: string = "batch";
    private MATCH_USERNAME_ATTR: string = "matchUsername";

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.initRepos();
    }

    private initRepos() {
        this.projectService.getRepositories(this.project, true).subscribe(
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
            this.projectService.batchModifyRepostoryAccessCredentials(this.project, repo.remoteRepoSummary.serverURL,
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
            this.projectService.modifyRepositoryAccessCredentials(this.project, repo.id,
                repo.remoteRepoSummary.username, repo.remoteRepoSummary.password).subscribe(
                    stResp => {
                        this.basicModals.alert("Credentials updated", "Credentials for the '" + repo.id +
                            "' remote repository have been updated");
                    }
                );
        }
    }



    ok() {
        this.activeModal.close();
    }

}