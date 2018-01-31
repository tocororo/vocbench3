import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { AbstractProjectComponent } from "./abstractProjectComponent";
import { ProjectPropertiesModal, ProjectPropertiesModalData } from "./projectPropertiesModal";
import { ProjectACLModal } from "./projectACL/projectACLModal";
import { ProjectTableConfigModal } from "./projectTableConfig/projectTableConfigModal";
import { ProjectServices } from "../services/projectServices";
import { MetadataServices } from "../services/metadataServices";
import { AdministrationServices } from "../services/administrationServices";
import { VBContext } from '../utils/VBContext';
import { VBProperties } from '../utils/VBProperties';
import { VBCollaboration } from '../utils/VBCollaboration';
import { UIUtils } from "../utils/UIUtils";
import { Cookie } from "../utils/Cookie";
import { Project, ProjectTypesEnum, ProjectTableColumnStruct } from '../models/Project';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { UserServices } from "../services/userServices";

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

    constructor(private projectService: ProjectServices, adminService: AdministrationServices, userService: UserServices,
        metadataService: MetadataServices, vbCollaboration: VBCollaboration, vbProp: VBProperties, 
        private router: Router, private basicModals: BasicModalServices, private modal: Modal, private elRef: ElementRef) {
        super(adminService, userService, metadataService, vbCollaboration, vbProp);
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
                    this.projectService.deleteProject(this.selectedProject).subscribe(
                        stResp => {
                            for (var i = 0; i < this.projectList.length; i++) { //remove project from list
                                if (this.projectList[i].getName() == this.selectedProject.getName()) {
                                    this.projectList.splice(i, 1);
                                }
                            }
                            this.selectedProject = null;
                        }
                    );
                },
                () => { }
            );
        }
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
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(ProjectPropertiesModal, overlayConfig)
    }

    private openACLModal() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('lg').toJSON() };
        return this.modal.open(ProjectACLModal, overlayConfig);
    }

    /**
     * TABLE SORT MANAGEMENT
     */

    private openTableConfig() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('sm').toJSON() };
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