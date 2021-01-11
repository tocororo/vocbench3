import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { from, Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { Settings } from "../models/Plugins";
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
import { ModalOptions, ModalType } from '../widget/modal/Modals';
import { PluginSettingsHandler } from "../widget/modal/sharedModal/pluginConfigModal/pluginConfigModal";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { AbstractProjectComponent } from "./abstractProjectComponent";
import { ACLEditorModal } from "./projectACL/aclEditorModal";
import { ProjectACLModal } from "./projectACL/projectACLModal";
import { ProjectDirModal } from "./projectDir/projectDirModal";
import { ProjectPropertiesModal } from "./projectPropertiesModal";
import { ProjectTableConfigModal } from "./projectTableConfig/projectTableConfigModal";
import { DeleteRemoteRepoModal } from "./remoteRepositories/deleteRemoteRepoModal";
import { DeleteRepositoryReportModal } from "./remoteRepositories/deleteRepositoryReportModal";
import { RemoteRepoEditorModal } from "./remoteRepositories/remoteRepoEditorModal";

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
        private repositoriesService: RepositoriesServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal, 
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
            this.columnOrder[colId] = { show: colStruct.translationKey, order: idx, flex: colStruct.flex }
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
    createProject() {
        this.router.navigate(["/Projects/CreateProject"]);
    }

    private deleteProject(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert({key:"ACTIONS.DELETE_PROJECT"}, {key:"MESSAGES.PROJECT_OPEN_CLOSE_AND_RETRY"}, ModalType.warning);
            return;
        } else {
            this.basicModals.confirm({key:"ACTIONS.DELETE_PROJECT"}, {key:"MESSAGES.DELETE_PROJECT_CONFIRM", params:{project: project.getName()}}, ModalType.warning).then(
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
        return this.projectService.deleteProject(project).pipe(
            map(() => {
                this.initProjects();
            })
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
                                const modalRef: NgbModalRef = this.modalService.open(DeleteRepositoryReportModal, new ModalOptions('lg'));
                                modalRef.componentInstance.deletingRepositories = deletingRepositories;
                                modalRef.componentInstance.exceptions = exceptions;
                            }
                        }
                    );
                }
            }
        );
    }

    private selectRemoteRepoToDelete(project: Project, repositories: RepositorySummary[]): Observable<RemoteRepositorySummary[]> {
        const modalRef: NgbModalRef = this.modalService.open(DeleteRemoteRepoModal, new ModalOptions());
        modalRef.componentInstance.project = project;
        modalRef.componentInstance.repositories = repositories;
        return from(
            modalRef.result.then(
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
        const modalRef: NgbModalRef = this.modalService.open(ProjectPropertiesModal, new ModalOptions('lg'));
        modalRef.componentInstance.project = project;
        return modalRef.result;
    }

    openACLModal() {
        if (this.projectList.length > 50) {
            this.basicModals.confirm({key:"PROJECTS.ACL.ACL_MATRIX"}, {key:"MESSAGES.ACL_TOO_MUCH_PROJ_CONFIRM", params:{projCount: this.projectList.length}}, ModalType.warning).then(
                () => { //confirmed
                    this.openACLMatrix();
                },
                () => {}
            )
        } else {
            this.openACLMatrix();
        }
    }

    private openACLMatrix() {
        this.modalService.open(ProjectACLModal, new ModalOptions('full'));
    }

    private editACL(project: Project) {
        const modalRef: NgbModalRef = this.modalService.open(ACLEditorModal, new ModalOptions('sm'));
        modalRef.componentInstance.project = project;
        return modalRef.result;
    }

    /** 
     * Opens a modal to edit the remote repositories credentials
     */
    private editRemoteRepoCredential(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert({key:"STATUS.OPERATION_DENIED"}, {key:"MESSAGES.CANNOT_EDIT_OPEN_PROJECT_CREDENTIALS"}, ModalType.warning);
            return;
        }
        const modalRef: NgbModalRef = this.modalService.open(RemoteRepoEditorModal, new ModalOptions());
        modalRef.componentInstance.project = project;
        return modalRef.result;
    }

    private editDirectory(project: Project, currentDir: string) {
        let availableDirs: string[] = [];
        this.projectDirs.forEach(pd => { 
            if (pd.dir != null) {
                availableDirs.push(pd.dir);
            }
        });


        const modalRef: NgbModalRef = this.modalService.open(ProjectDirModal, new ModalOptions());
        modalRef.componentInstance.project = project;
		modalRef.componentInstance.currentDir = currentDir;
		modalRef.componentInstance.availableDirs = availableDirs;
        return modalRef.result.then(
            () => { //directory changed
                this.initProjects();
            },
            () => {} //directory not changed
        )
    }

    private renameDirectory(directory: string) {
        this.basicModals.prompt({key:"ACTIONS.RENAME_PROJECT_DIRECTORY"}, { value: "Directory name" }, null, directory).then(
            newName => {
                if (newName != directory) {
                    if (this.projectDirs.some(pd => pd.dir == newName)) { //name changed, but a directory with the same name already exists
                        this.basicModals.confirm({key:"ACTIONS.RENAME_PROJECT_DIRECTORY"}, 
                        {key:"MESSAGES.ALREADY_EXISTING_PROJ_DIR_CONFIRM", params:{targetDirName: newName, sourceDirName: directory}}, ModalType.warning).then(
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
            }
        )
    }

    private editDescription(project: Project) {
        this.basicModals.prompt({key:"MODELS.PROJECT.DESCRIPTION"}, { value: "Description" }, null, project.getDescription(), true).then(
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

    private editFacets(project: Project) {
        this.sharedModals.configurePlugin(project.getFacets2()).then(facets => {
            this.projectService.setProjectFacets(project, facets).subscribe();
        }, () => {});
    }

    editFacetsSchema() {
        let handler: PluginSettingsHandler = (facets: Settings) => this.projectService.setProjectFacetsSchema(facets);
        this.projectService.getProjectFacetsSchema().subscribe(facetsSchema => {
            this.sharedModals.configurePlugin(facetsSchema, handler).then(
                facets => { //changed settings
                    this.initProjects(); 
                },
                () => {}  //nothing changed
            );    
        });
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(ProjectTableConfigModal, new ModalOptions('sm'));
        modalRef.result.then(
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