import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ExceptionDAO, Project, ProjectColumnId, ProjectTableColumnStruct, ProjectUtils, ProjectViewMode, RemoteRepositorySummary, RepositorySummary } from '../models/Project';
import { MetadataServices } from "../services/metadataServices";
import { ProjectServices } from "../services/projectServices";
import { RepositoriesServices } from "../services/repositoriesServices";
import { UserServices } from "../services/userServices";
import { Cookie } from "../utils/Cookie";
import { DatatypeValidator } from "../utils/DatatypeValidator";
import { UIUtils } from "../utils/UIUtils";
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBContext } from '../utils/VBContext';
import { VBProperties } from '../utils/VBProperties';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { AbstractProjectComponent } from "./abstractProjectComponent";
import { ACLEditorModal, ACLEditorModalData } from "./projectACL/aclEditorModal";
import { ProjectACLModal } from "./projectACL/projectACLModal";
import { ProjectDirModal, ProjectDirModalData } from "./projectDir/projectDirModal";
import { ProjectPropertiesModal, ProjectPropertiesModalData } from "./projectPropertiesModal";
import { ProjectTableConfigModal } from "./projectTableConfig/projectTableConfigModal";
import { DeleteRemoteRepoModal, DeleteRemoteRepoModalData } from "./remoteRepositories/deleteRemoteRepoModal";
import { DeleteRepositoryReportModal, DeleteRepositoryReportModalData } from "./remoteRepositories/deleteRepositoryReportModal";
import { RemoteRepoEditorModal, RemoteRepoEditorModalData } from "./remoteRepositories/remoteRepoEditorModal";

@Component({
    selector: "project-component",
    templateUrl: "./projectComponent.html",
    host: { class: "pageComponent" },
})
export class ProjectComponent extends AbstractProjectComponent implements OnInit {

    private columnIDs: ProjectColumnId[] = [ProjectColumnId.accessed, ProjectColumnId.history, ProjectColumnId.lexicalization,
        ProjectColumnId.location, ProjectColumnId.model, ProjectColumnId.name, ProjectColumnId.open, ProjectColumnId.validation];
    private columnOrder: { [id: string]: { show: string, flex: number, order: number} };

    constructor(private projectService: ProjectServices, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator, 
        private repositoriesService: RepositoriesServices, private basicModals: BasicModalServices, private modal: Modal, 
        private router: Router) {
        super(userService, metadataService, vbCollaboration, vbProp, dtValidator);
    }

    initProjects() {
        //init visualization mode
        this.visualizationMode = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE) == ProjectViewMode.dir ? ProjectViewMode.dir : ProjectViewMode.list;

        //init column order
        this.columnOrder = {};
        let columns: ProjectTableColumnStruct[] = ProjectUtils.getDefaultProjectTableColumns();
        let customOrder: ProjectColumnId[] = this.getCustomColumnsSetting(); //this setting contains the (ordered) IDs of the columns to show
        customOrder.forEach((colId: ProjectColumnId, idx: number) => {
            let colStruct: ProjectTableColumnStruct = columns.find(c => c.id == colId); //retrieve the column struct
            this.columnOrder[colId] = { show: colStruct.name, order: idx, flex: colStruct.flex }
        })

        //init project list
        this.projectService.listProjects().subscribe(
            projectList => {
                this.projectList = projectList;

                this.initProjectDirectories();
            }
        );
    }

    private openOrCloseProject(project: Project) {
        if (project.isOpen()) {
            this.closeProject(project);
        } else {
            this.openProject(project);
        }
    }

    private openProject(project: Project) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.accessProject(project).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                project.setOpen(true);
                this.accessProject(project).subscribe();
            },
            (err: Error) => {
                this.projectService.handleMissingChangetrackierSailError(err, this.basicModals);
            }
        );
    }

    private activateProject(project: Project) {
        var workingProj = VBContext.getWorkingProject();
        if (workingProj == undefined || workingProj.getName() != project.getName()) {
            this.accessProject(project).subscribe();
        }
    }

    /**
     * Redirects to the import project page
     */
    private createProject() {
        this.router.navigate(["/Projects/CreateProject"]);
    }

    private deleteProject(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert("Delete project", project.getName() +
                " is currently open. Please, close the project and then retry.", "warning");
            return;
        } else {
            this.basicModals.confirm("Delete project", "Warning, this operation will delete the project " +
                project.getName() + ". Are you sure to proceed?", "warning").then(
                result => {
                    //retrieve the remote repositories referenced by the deleting project (this must be done before the deletion in order to prevent errors)
                    this.projectService.getRepositories(project, true).subscribe(
                        (repositories: RepositorySummary[]) => {
                            this.deleteImpl(project).subscribe( //delete the project
                                () => {
                                    if (repositories.length > 0) { //if the deleted project was linked with remote repositories proceed with the deletion
                                        this.deleteRemoteRepo(project, repositories);
                                    }
                                }
                            )
                        }
                    )
                },
                () => { }
            );
        }
    }

    private deleteImpl(project: Project): Observable<void> {
        return this.projectService.deleteProject(project).map(
            stResp => {
                this.initProjects();
            }
        );
    }

    private deleteRemoteRepo(deletedProject: Project, repositories: RepositorySummary[]) {
        this.selectRemoteRepoToDelete(deletedProject, repositories).subscribe( //ask to the user which repo delete
            (deletingRepositories: RemoteRepositorySummary[]) => {
                if (deletingRepositories.length > 0) {
                    UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                    this.repositoriesService.deleteRemoteRepositories(deletingRepositories).subscribe( //delete them
                        (exceptions: ExceptionDAO[]) => {
                            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                            if (exceptions.some(e => e != null)) { //some deletion has failed => show the report
                                var modalData = new DeleteRepositoryReportModalData(deletingRepositories, exceptions);
                                const builder = new BSModalContextBuilder<DeleteRepositoryReportModalData>(
                                    modalData, undefined, DeleteRepositoryReportModalData
                                );
                                let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size("lg").toJSON() };
                                this.modal.open(DeleteRepositoryReportModal, overlayConfig);
                            }
                        }
                    );
                }
            }
        );
    }

    private selectRemoteRepoToDelete(project: Project, repositories: RepositorySummary[]): Observable<RemoteRepositorySummary[]> {
        var modalData = new DeleteRemoteRepoModalData(project, repositories);
        const builder = new BSModalContextBuilder<DeleteRemoteRepoModalData>(
            modalData, undefined, DeleteRemoteRepoModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return Observable.fromPromise(
            this.modal.open(DeleteRemoteRepoModal, overlayConfig).result.then(
                repos => {
                    return repos;
                }
            )
        );
    }

    /**
     * Calls the proper service in order to disconnect from the given project.
     */
    private closeProject(project: Project) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.disconnectFromProject(project).subscribe(
            stResp => {
                project.setOpen(false);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            }
        );
    }

    /**
     * Opens a modal to show the properties of the selected project
     */
    private openPropertyModal(project: Project) {
        var modalData = new ProjectPropertiesModalData(project);
        const builder = new BSModalContextBuilder<ProjectPropertiesModalData>(
            modalData, undefined, ProjectPropertiesModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(ProjectPropertiesModal, overlayConfig)
    }

    private openACLModal() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.dialogClass("modal-dialog modal-xl").keyboard(27).toJSON() };
        return this.modal.open(ProjectACLModal, overlayConfig);
    }

    private editACL(project: Project) {
        var modalData = new ACLEditorModalData(project);
        const builder = new BSModalContextBuilder<ACLEditorModalData>(
            modalData, undefined, ACLEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size("sm").keyboard(27).toJSON() };
        return this.modal.open(ACLEditorModal, overlayConfig);
    }

    /** 
     * Opens a modal to edit the remote repositories credentials
     */
    private editRemoteRepoCredential(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert("Edit remote repository credentials", 
                "You cannot edit credentials of remote repositories linked to an open project. Please, close the project and retry", "warning");
            return;
        }
        var modalData = new RemoteRepoEditorModalData(project);
        const builder = new BSModalContextBuilder<RemoteRepoEditorModalData>(
            modalData, undefined, RemoteRepoEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(RemoteRepoEditorModal, overlayConfig)
    }

    private editDirectory(project: Project, currentDir: string) {
        let availableDirs: string[] = [];
        this.projectDirs.forEach(pd => { 
            if (pd.dir != null) {
                availableDirs.push(pd.dir);
            }
        });
        var modalData = new ProjectDirModalData(project, currentDir, availableDirs);
        const builder = new BSModalContextBuilder<ProjectDirModalData>(
            modalData, undefined, ProjectDirModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ProjectDirModal, overlayConfig).result.then(
            () => { //directory changed
                this.initProjects();
            },
            () => {} //directory not changed
        )
    }

    private renameDirectory(directory: string) {
        this.basicModals.prompt("Rename project directory", { value: "Directory name" }, null, directory).then(
            newName => {
                if (this.projectDirs.some(pd => pd.dir == newName)) {
                    this.basicModals.confirm("Rename project directory", "Warning: a project directory named '" + newName + "' already exists." + 
                        " You will move there all the projects contained in directory '" + directory + "'. Do you want to continue?", "warning").then(
                        () => { //confirmed => apply rename
                            this.projectService.renameProjectFacetDir(directory, newName).subscribe(
                                () => {
                                    this.initProjects();
                                }
                            );
                        },
                        () => {}
                    )
                } else {
                    this.projectService.renameProjectFacetDir(directory, newName).subscribe(
                        () => {
                            this.initProjects();
                        }
                    );
                }
            }
        )
    }

    private editDescription(project: Project) {
        this.basicModals.prompt("Project description", { value: "Description" }, null, project.getDescription(), true).then(
            descr => {
                if (descr.trim() == "") {
                    descr = null;
                }
                this.projectService.setProjectProperty(project, "description", descr).subscribe(
                    () => {
                        project.setDescription(descr);
                    }
                )
            },
            () => {}
        )
    }

    private settings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.size('sm').keyboard(27).toJSON() };
        this.modal.open(ProjectTableConfigModal, overlayConfig).result.then(
            () => { //changed settings
                this.initProjects();
            },
            () => {} //nothing changed
        );
    }

    /**
     * COOKIE MANAGEMENT
     */

    private getCustomColumnsSetting(): ProjectColumnId[] {
        let columnOrder: ProjectColumnId[] = ProjectUtils.defaultTableOrder;
        let colOrderCookie = Cookie.getCookie(Cookie.PROJECT_TABLE_ORDER); //this cookie contains the (ordered) comma separated IDs of the columns to show
        if (colOrderCookie != null) {
            columnOrder = <ProjectColumnId[]>colOrderCookie.split(",");
        }
        return columnOrder;
    }

    

}