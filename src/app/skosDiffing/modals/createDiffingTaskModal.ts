import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { RepositoryLocation, RepositoryStatus, VersionInfo } from "../../models/History";
import { Project } from "../../models/Project";
import { SKOS } from "../../models/Vocabulary";
import { ProjectServices } from "../../services/projectServices";
import { SkosDiffingServices } from "../../services/skosDiffingServices";
import { VersionsServices } from "../../services/versionsServices";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "create-diffing-task-modal",
    templateUrl: "./createDiffingTaskModal.html",
})
export class CreateDiffingTaskModal {

    modes: { mode: DiffingMode, show: string }[] = [
        { mode: DiffingMode.projects, show: "Compare the current project with an external one" },
        { mode: DiffingMode.versions, show: "Compare two different versions of the current project" }
    ];
    mode: DiffingMode;

    private leftDataset: DatasetStruct = {};
    private rightDataset: DatasetStruct = {};

    private versions: VersionInfo[]; //list of available versions of the current project (used if mode is versions)
    private projects: Project[]; //list of available target projects (used if mode is projects)


    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices, private versionsService: VersionsServices,
        private diffingService: SkosDiffingServices, private basicModals: BasicModalServices) {
    }

    onModeChange() {
        //reset both datasets
        this.leftDataset = {};
        this.rightDataset = {};
        
        if (this.mode == DiffingMode.projects) {
            if (this.projects == null) { //init projects list for target dataset
                this.projectService.listProjects(VBContext.getWorkingProject(), false, true).subscribe(
                    projects => {
                        this.projects = projects.filter(p => p.getModelType() == SKOS.uri);
                    }
                );
            }
            //init the left dataset to the current project
            this.leftDataset.project = VBContext.getWorkingProject();
        } else { //versions
            //both the dataset are the current project
            this.leftDataset.project = VBContext.getWorkingProject();
            this.rightDataset.project = VBContext.getWorkingProject();
            if (this.versions == null) {
                this.versionsService.getVersions().subscribe(
                    versions => {
                        this.versions = [{ 
                            versionId: "CURRENT", 
                            dateTimeLocal: "---", 
                            dateTime: null, 
                            repositoryId: null, 
                            repositoryLocation: null, 
                            repositoryStatus: RepositoryStatus.INITIALIZED 
                        }];
                        this.versions = this.versions.concat(versions);
                        //init the left dataset to the current version
                        this.leftDataset.version = this.versions[0];
                    }
                )
            } else {
                this.leftDataset.version = this.versions[0];
            }
            
        }
    }

    isOkEnabled() {
        if (this.mode == DiffingMode.projects) {
            return this.leftDataset.project != null && this.rightDataset.project != null;
        } else {
            return this.leftDataset.project != null && this.rightDataset.project != null &&
                this.leftDataset.version != null && this.rightDataset.version != null;
        }
        
    }

    ok() {
        //get as language list those set as rendering by the user
        let langs: string[] = [];
        let renderingLangs: string[] = VBContext.getWorkingProjectCtx().getProjectPreferences().projectLanguagesPreference;
        if (renderingLangs != null && !(renderingLangs.length == 1 && renderingLangs[0] == "*")) {
            langs = renderingLangs;
        }
        if (this.mode == DiffingMode.projects) {
            if (!this.leftDataset.project.isRepositoryRemote()) {
                this.basicModals.alert({key:"STATUS.ERROR"}, "Cannot run a SKOS diffing task on project '" + this.leftDataset.project.getName() 
                    + "' since it is hosted on a repository that does not have a SPARQL endpoint", ModalType.warning);
                return;
            }
            if (!this.rightDataset.project.isRepositoryRemote()) {
                this.basicModals.alert({key:"STATUS.ERROR"}, "Cannot run a SKOS diffing task on project '" + this.rightDataset.project.getName() 
                    + "' since it is hosted on a repository that does not have a SPARQL endpoint", ModalType.warning);
                return;
            }
            this.diffingService.runDiffing(this.leftDataset.project, this.rightDataset.project, null, null, langs).subscribe(
                taskId => {
                    this.activeModal.close(taskId);
                }
            );
        } else { //versions
            //check if selected versions are different
            if (this.leftDataset.version == this.rightDataset.version) {
                this.basicModals.alert({key:"STATUS.ERROR"}, "Cannot compare two identical versions of the project", ModalType.warning);
                return;
            }
            //check if selected versions are remote
            if ((this.leftDataset.version.repositoryId == null || this.leftDataset.version.repositoryId == null) && !this.leftDataset.project.isRepositoryRemote()) {
                //current version of a local project
                this.basicModals.alert({key:"STATUS.ERROR"}, "Cannot run a SKOS diffing task on version 'CURRENT' since it is hosted on a " + 
                    "repository that does not have a SPARQL endpoint", ModalType.warning);
                return;
            }
            if (this.leftDataset.version.repositoryId != null && this.leftDataset.version.repositoryLocation != RepositoryLocation.REMOTE) {
                this.basicModals.alert({key:"STATUS.ERROR"}, "Cannot run a SKOS diffing task on version '" + this.leftDataset.version.versionId + 
                    "' since it is hosted on a repository that does not have a SPARQL endpoint", ModalType.warning);
                return;
            }
            if (this.rightDataset.version.repositoryId != null && this.rightDataset.version.repositoryLocation != RepositoryLocation.REMOTE) {
                this.basicModals.alert({key:"STATUS.ERROR"}, "Cannot run a SKOS diffing task on version '" + this.rightDataset.version.versionId + 
                    "' since it is hosted on a repository that does not have a SPARQL endpoint", ModalType.warning);
                return;
            }
            this.diffingService.runDiffing(this.leftDataset.project, this.rightDataset.project, 
                this.leftDataset.version.repositoryId, this.rightDataset.version.repositoryId, langs).subscribe(
                taskId => {
                    this.activeModal.close(taskId);
                }
            );
        }
    }
    
    cancel() {
        this.activeModal.dismiss();
    }

}

enum DiffingMode {
    versions = "versions", //between two different versions of the same projects
    projects = "projects" //between two different projects
}

interface DatasetStruct {
    project?: Project;
    version?: VersionInfo;
}