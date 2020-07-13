import { Component } from "@angular/core";
import { RepositoryStatus, VersionInfo } from "../models/History";
import { DatasetMetadata } from "../models/Metadata";
import { Project, RepositorySummary } from "../models/Project";
import { ProjectServices } from "../services/projectServices";
import { SkosDiffingServices } from "../services/skosDiffingServices";
import { VersionsServices } from "../services/versionsServices";
import { VBContext } from "../utils/VBContext";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { versions } from "process";
import { SKOS } from "../models/Vocabulary";

@Component({
    selector: "skos-diffing",
    templateUrl: "./skosDiffingComponent.html",
    host: { class: "pageComponent" }
})
export class SkosDiffingComponent {

    private mode: DiffingMode;
    private modes: { mode: DiffingMode, show: string }[] = [
        { mode: DiffingMode.projects, show: "Compare the current project with an external one" },
        { mode: DiffingMode.versions, show: "Compare two different versions of the current project" }
    ];

    private leftDataset: DatasetStruct;
    private rightDataset: DatasetStruct;

    private versions: VersionInfo[]; //list of available versions of the current project (used if mode is versions)
    private projects: Project[]; //list of available target projects (used if mode is projects)

    constructor(private versionsService: VersionsServices, private projectService: ProjectServices, 
        private diffingService: SkosDiffingServices, private basicModals: BasicModalServices) {}

    private onModeChange() {
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
                        this.versions = [ { versionId: "CURRENT", dateTimeLocal: "---", dateTime: null, repositoryId: null, status: RepositoryStatus.INITIALIZED } ];
                        this.versions = this.versions.concat(versions);
                        //init the left dataset to the current version
                        this.leftDataset.version = this.versions[0];
                    }
                )
            }
            
        }
    }

    private startDiffing() {
        if (this.mode == DiffingMode.projects) {
            if (!this.leftDataset.project.isRepositoryRemote()) {
                this.basicModals.alert("SKOS diffing", "Cannot run a SKOS diffing task on project '" + this.leftDataset.project.getName() 
                    + "' since it is hosted on a repository that does not have a SPARQL endpoint", "warning");
                return;
            }
            if (!this.rightDataset.project.isRepositoryRemote()) {
                this.basicModals.alert("SKOS diffing", "Cannot run a SKOS diffing task on project '" + this.rightDataset.project.getName() 
                    + "' since it is hosted on a repository that does not have a SPARQL endpoint", "warning");
                return;
            }
            this.diffingService.runDiffing(this.leftDataset.project, this.rightDataset.project).subscribe();
        } else { //versions
            //check if selected versions are different
            if (this.leftDataset.version == this.rightDataset.version) {
                this.basicModals.alert("SKOS diffing", "Cannot compare two identical versions of the project", "warning");
                return;
            }
            //check if selected versions are remote
            if ((this.leftDataset.version.repositoryId == null || this.leftDataset.version.repositoryId == null) && !this.leftDataset.project.isRepositoryRemote()) {
                //current version of a local project
                this.basicModals.alert("SKOS diffing", "Cannot run a SKOS diffing task on version 'CURRENT' since it is hosted on a " + 
                    "repository that does not have a SPARQL endpoint", "warning");
                return;
            }
            // if (this.leftDataset.version.repositoryId != null) {
            //     let versionRepo = this.projectRepositories.find(r => r.id == this.leftDataset.version.repositoryId);
            //     if (versionRepo.remoteRepoSummary.serverURL == null) {
            //         this.basicModals.alert("SKOS diffing", "Cannot run a SKOS diffing task on version '" + this.leftDataset.version.versionId + 
            //             "' since it is hosted on a repository that does not have a SPARQL endpoint", "warning");
            //         return;
            //     }
            // }
            // if (this.rightDataset.version.repositoryId != null) {
            //     let versionRepo = this.projectRepositories.find(r => r.id == this.rightDataset.version.repositoryId);
            //     if (versionRepo.remoteRepoSummary.serverURL == null) {
            //         this.basicModals.alert("SKOS diffing", "Cannot run a SKOS diffing task on version '" + this.rightDataset.version.versionId + 
            //             "' since it is hosted on a repository that does not have a SPARQL endpoint", "warning");
            //         return;
            //     }
            // }
            this.diffingService.runDiffing(this.leftDataset.project, this.rightDataset.project, 
                this.leftDataset.version.repositoryId, this.rightDataset.version.repositoryId).subscribe();
        }
    }

}

enum DiffingMode {
    versions = "versions", //between two different versions of the same projects
    projects = "projects" //between two different projects
}

interface DatasetStruct {
    project?: Project;
    version?: VersionInfo;
    dataset?: DatasetMetadata;
}