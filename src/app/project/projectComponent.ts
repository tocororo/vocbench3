import { Component, ElementRef, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ExceptionDAO, Project, ProjectTableColumnStruct, RemoteRepositorySummary, RepositorySummary } from '../models/Project';
import { MetadataServices } from "../services/metadataServices";
import { ProjectServices } from "../services/projectServices";
import { RepositoriesServices } from "../services/repositoriesServices";
import { UserServices } from "../services/userServices";
import { DatatypeValidator } from "../utils/DatatypeValidator";
import { UIUtils } from "../utils/UIUtils";
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBContext } from '../utils/VBContext';
import { VBProperties } from '../utils/VBProperties';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { AbstractProjectComponent } from "./abstractProjectComponent";
import { ProjectACLModal } from "./projectACL/projectACLModal";
import { ProjectPropertiesModal, ProjectPropertiesModalData } from "./projectPropertiesModal";
import { ProjectTableConfigModal } from "./projectTableConfig/projectTableConfigModal";
import { DeleteRemoteRepoModal, DeleteRemoteRepoModalData } from "./remoteRepositories/deleteRemoteRepoModal";
import { DeleteRepositoryReportModal, DeleteRepositoryReportModalData } from "./remoteRepositories/deleteRepositoryReportModal";
import { RemoteRepoEditorModal, RemoteRepoEditorModalData } from "./remoteRepositories/remoteRepoEditorModal";

@Component({
    selector: "project-component",
    templateUrl: "./projectComponent.html",
    host: { class: "pageComponent" }
})
export class ProjectComponent extends AbstractProjectComponent implements OnInit {
    private projectList: Project[];
    private selectedProject: Project; //project selected in the list

    private defaultColumnsOrder: string[]; //default order of the columns (contains only the columns visible according the custom configuration)
    private customColumnsOrder: string[]; //custom order of the columns

    constructor(private projectService: ProjectServices, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator, 
        private repositoriesService: RepositoriesServices, private basicModals: BasicModalServices, private modal: Modal, 
        private router: Router, private elRef: ElementRef) {
        super(userService, metadataService, vbCollaboration, vbProp, dtValidator);
    }

    ngOnInit() {
        this.initTable()
    }

    private initTable() {
        let columns: ProjectTableColumnStruct[] = this.vbProp.getCustomProjectTableColumns();
        this.customColumnsOrder = [];
        columns.forEach(c => { if (c.show) this.customColumnsOrder.push(c.name) });

        let defaultColumns = this.vbProp.getDefaultProjectTableColumns();
        this.defaultColumnsOrder = []; 
        defaultColumns.forEach(c => { if (this.customColumnsOrder.indexOf(c.name) != -1) this.defaultColumnsOrder.push(c.name) });

        this.projectService.listProjects().subscribe(
            projectList => {
                this.projectList = projectList;
                setTimeout(() => { //timeout in order to to trigger a new round of change detection and so wait that the table is rendered
                    this.sortColumns();
                });
            }
        );
    }

    private selectProject(project: Project) {
        if (this.selectedProject == project) {
            this.selectedProject = null;
        } else {
            this.selectedProject = project;
        }
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

    private deleteProject() {
        if (this.selectedProject.isOpen()) {
            this.basicModals.alert("Delete project", this.selectedProject.getName() +
                " is currently open. Please, close the project and then retry.", "warning");
            return;
        } else {
            this.basicModals.confirm("Delete project", "Attention, this operation will delete the project " +
                this.selectedProject.getName() + ". Are you sure to proceed?", "warning").then(
                result => {
                    let deletingProject: Project = this.selectedProject;
                    //retrieve the remote repositories referenced by the deleting project (this must be done before the deletion in order to prevent errors)
                    this.projectService.getRepositories(deletingProject, true).subscribe(
                        (repositories: RepositorySummary[]) => {
                            this.deleteImpl().subscribe( //delete the project
                                () => {
                                    if (repositories.length > 0) { //if the deleted project was linked with remote repositories proceed with the deletion
                                        this.deleteRemoteRepo(deletingProject, repositories);
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

    private deleteImpl(): Observable<void> {
        return this.projectService.deleteProject(this.selectedProject).map(
            stResp => {
                for (var i = 0; i < this.projectList.length; i++) { //remove project from list
                    if (this.projectList[i].getName() == this.selectedProject.getName()) {
                        this.projectList.splice(i, 1);
                    }
                }
                this.selectedProject = null;
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
    private openPropertyModal() {
        var modalData = new ProjectPropertiesModalData(this.selectedProject);
        const builder = new BSModalContextBuilder<ProjectPropertiesModalData>(
            modalData, undefined, ProjectPropertiesModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(ProjectPropertiesModal, overlayConfig)
    }

    private openACLModal() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(ProjectACLModal, overlayConfig);
    }

    /** 
     * Opens a modal to edit the remote repositories credentials
     */
    private editRemoteRepoCredential(project: Project) {
        var modalData = new RemoteRepoEditorModalData(project);
        const builder = new BSModalContextBuilder<RemoteRepoEditorModalData>(
            modalData, undefined, RemoteRepoEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(RemoteRepoEditorModal, overlayConfig)
    }

    /**
     * TABLE SORT MANAGEMENT
     */

    private openTableConfig() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.size('sm').keyboard(27).toJSON() };
        this.modal.open(ProjectTableConfigModal, overlayConfig).result.then(
            res => {
                this.initTable();
            }
        );
    }

    private showColumn(name: string): boolean {
        return this.customColumnsOrder.indexOf(name) != -1;
    }

    private sortColumns() {
        let swapped: boolean; //flag to report that there has been a column swap
        do {
            swapped = false;
            for (var i = 0; i < this.defaultColumnsOrder.length-1; i++) {
                let col: string = this.defaultColumnsOrder[i];
                let followingCol: string = this.defaultColumnsOrder[i+1];
                //if in the "target" order, the two following columns are inverted in the order, swap them
                if (this.customColumnsOrder.indexOf(col) > this.customColumnsOrder.indexOf(followingCol)) {
                    let td: NodeList = this.elRef.nativeElement.querySelectorAll('td');
                    this.swapWithPreviousColumn(td, i+1);
                    //swap also the defaultColumnsOrder
                    let c = this.defaultColumnsOrder[i+1];
                    this.defaultColumnsOrder[i+1] = this.defaultColumnsOrder[i];
                    this.defaultColumnsOrder[i] = c;
                    swapped = true;
                }
            }
        } while (swapped); //do the sort until there is no more swap to perform
    }

    private swapWithPreviousColumn(td: NodeList, idx: number) {
        let nColumn: number = this.customColumnsOrder.length
        for (var rowIdx = 0; rowIdx < this.projectList.length; rowIdx++) {
            let idxCellFrom = rowIdx*nColumn+idx;
            let idxCellTo = rowIdx*nColumn+idx-1;
            td.item(idxCellFrom).parentNode.insertBefore(td.item(idxCellFrom), td.item(idxCellTo));
        }
    }

}