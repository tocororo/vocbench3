import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { from, Observable } from "rxjs";
import { finalize, map } from 'rxjs/operators';
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
import { OpenAllProjReportModal } from "./openAllProjReportModal";
import { ACLEditorModal } from "./projectACL/aclEditorModal";
import { ProjectACLModal } from "./projectACL/projectACLModal";
import { ProjectPropertiesModal } from "./projectPropertiesModal";
import { ProjSettingsEditorModal } from "./projectSettingsEditor/projectSettingsEditorModal";
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

    constructor(projectService: ProjectServices, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator, modalService: NgbModal,
        private repositoriesService: RepositoriesServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, 
        private router: Router) {
        super(projectService, userService, metadataService, vbCollaboration, vbProp, dtValidator, modalService);
    }

    //@Override the one in the abstract parent since it needs to initialize the column order first
    initProjects() {
        //init column order
        this.columnOrder = {};
        let columns: ProjectTableColumnStruct[] = ProjectUtils.getDefaultProjectTableColumns();
        let customOrder: ProjectColumnId[] = this.getCustomColumnsSetting(); //this setting contains the (ordered) IDs of the columns to show
        customOrder.forEach((colId: ProjectColumnId, idx: number) => {
            let colStruct: ProjectTableColumnStruct = columns.find(c => c.id == colId); //retrieve the column struct
            this.columnOrder[colId] = { show: colStruct.translationKey, order: idx, flex: colStruct.flex }
        })

        super.initProjects();
    }

    getListProjectsFn() {
        return this.projectService.listProjects();
    }

    getRetrieveProjectsBagsFn(bagOfFacet: string) {
        return this.projectService.retrieveProjects(bagOfFacet);
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
            () => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                project.setOpen(true);
                this.accessProject(project).subscribe();
            },
            (err: Error) => {
                this.projectService.handleMissingChangetrackierSailError(err, this.basicModals);
            }
        );
    }

    openAll() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.accessAllProjects().subscribe(
            (report: {[key: string]: ExceptionDAO }) => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                if (Object.keys(report).length != 0) {
                    const modalRef: NgbModalRef = this.modalService.open(OpenAllProjReportModal, new ModalOptions('lg'));
                    modalRef.componentInstance.report = report;
                    modalRef.result.then(() => {
                        this.initProjects()
                    })
                } else {
                    this.initProjects()
                }
            }
        );
    }

    /**
     * Calls the proper service in order to disconnect from the given project.
     */
    private closeProject(project: Project) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.disconnectFromProject(project).subscribe(
            () => {
                project.setOpen(false);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
            }
        );
    }

    closeAll() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.projectService.disconnectFromAllProjects().subscribe(
            () => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.initProjects();
            }
        );
    }

    activateProject(project: Project) {
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

    deleteProject(project: Project) {
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
     * Opens a modal to show the properties of the selected project
     */
    openPropertyModal(project: Project) {
        const modalRef: NgbModalRef = this.modalService.open(ProjectPropertiesModal, new ModalOptions('lg'));
        modalRef.componentInstance.project = project;
        return modalRef.result;
    }

    openACLModal() {
        let projLength: number = 0;
        if (this.visualizationMode == ProjectViewMode.list) {
            projLength = this.projectList.length;
        } else {
            this.projectDirs.forEach(dir => projLength = projLength + dir.projects.length);
        }
        if (projLength > 50) {
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

    editACL(project: Project) {
        const modalRef: NgbModalRef = this.modalService.open(ACLEditorModal, new ModalOptions('sm'));
        modalRef.componentInstance.project = project;
        return modalRef.result;
    }

    /** 
     * Opens a modal to edit the remote repositories credentials
     */
    editRemoteRepoCredential(project: Project) {
        if (project.isOpen()) {
            this.basicModals.alert({key:"STATUS.OPERATION_DENIED"}, {key:"MESSAGES.CANNOT_EDIT_OPEN_PROJECT_CREDENTIALS"}, ModalType.warning);
            return;
        }
        const modalRef: NgbModalRef = this.modalService.open(RemoteRepoEditorModal, new ModalOptions());
        modalRef.componentInstance.project = project;
        return modalRef.result;
    }

    editDescription(project: Project) {
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

    editFacets(project: Project) {
        this.sharedModals.configurePlugin(project.getFacets()).then(facets => {
            this.projectService.setProjectFacets(project, facets).subscribe(
                () => {
                    project.setFacets(facets); //update facets in project
                    if (this.visualizationMode == ProjectViewMode.facet) {
                        this.initProjects();
                    }
                }
            );
        }, () => {});
    }

    editCustomFacetsSchema() {
        let handler: PluginSettingsHandler = (facets: Settings) => this.projectService.setCustomProjectFacetsSchema(facets);
        this.projectService.getCustomProjectFacetsSchema().subscribe(facetsSchema => {
            this.sharedModals.configurePlugin(facetsSchema, handler, "lg").then(
                facets => { //changed settings
                    this.initProjects(); 
                },
                () => {}  //nothing changed
            );    
        });
    }

    editSettings(project: Project) {
        const modalRef: NgbModalRef = this.modalService.open(ProjSettingsEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.project = project;
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