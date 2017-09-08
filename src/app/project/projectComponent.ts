import { Component, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { ProjectPropertiesModal, ProjectPropertiesModalData } from "./projectPropertiesModal";
import { ProjectACLModal } from "./projectACL/projectACLModal";
import { ProjectTableConfigModal } from "./projectTableConfig/projectTableConfigModal";
import { ProjectServices } from "../services/projectServices";
import { MetadataServices } from "../services/metadataServices";
import { AdministrationServices } from "../services/administrationServices";
import { VBContext } from '../utils/VBContext';
import { VBProperties } from '../utils/VBProperties';
import { UIUtils } from "../utils/UIUtils";
import { Cookie } from "../utils/Cookie";
import { Project, ProjectTypesEnum, ProjectTableColumnStruct } from '../models/Project';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "project-component",
    templateUrl: "./projectComponent.html",
    host: { class: "pageComponent" }
})
export class ProjectComponent implements OnInit {
    private projectList: Project[];
    private selectedProject: Project; //project selected in the list

    private defaultColumnsOrder: string[]; //default order of the columns (contains only the columns visible according the custom configuration)
    private customColumnsOrder: string[]; //custom order of the columns

    constructor(private projectService: ProjectServices, private metadataService: MetadataServices, private adminService: AdministrationServices,
        private vbProperties: VBProperties, private router: Router, private basicModals: BasicModalServices, private modal: Modal,
        private elRef: ElementRef) {
    }

    ngOnInit() {
        this.initTable()
    }

    private initTable() {
        let columns: ProjectTableColumnStruct[] = this.vbProperties.getCustomProjectTableColumns();
        this.customColumnsOrder = [];
        columns.forEach(c => { if (c.show) this.customColumnsOrder.push(c.name) });

        let defaultColumns = this.vbProperties.getDefaultProjectTableColumns();
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

    private accessProject(project: Project) {
        var workingProj = VBContext.getWorkingProject();
        if (workingProj == undefined || workingProj.getName() != project.getName()) {
            this.openProject(project);
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
     * Redirects to the import project page
     */
    private importProject() {
        this.router.navigate(["/Projects/ImportProject"]);
    }

    /**
     * Exports current selected project (only if it's open) as a zip archive
     */
    private exportProject() {
        if (!this.selectedProject.isOpen()) {
            this.basicModals.alert("Export project", "You can export only open projects", "error");
            return;
        }
        this.projectService.exportProject(this.selectedProject).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink("Export project", null, exportLink, "export.zip");
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
                VBContext.setWorkingProject(project);
                VBContext.setProjectChanged(true);
                project.setOpen(true);
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                //get default namespace of the project and set it to the vbContext
                this.metadataService.getNamespaceMappings().subscribe();
                //init the project preferences for the project
                this.vbProperties.initUserProjectPreferences();
                this.vbProperties.initProjectSettings();
                //init the Project-User binding
                this.adminService.getProjectUserBinding(project.getName(), VBContext.getLoggedUser().getEmail()).subscribe(
                    puBinding => {
                        VBContext.setProjectUserBinding(puBinding);
                    }
                );
            }
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
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(ProjectPropertiesModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    private openACLModal() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('lg').toJSON() };
        return this.modal.open(ProjectACLModal, overlayConfig);
    }

    /**
     * Useful to set as selected the radio button of the working project
     */
    private isWorkingProject(project: Project): boolean {
        var workingProj = VBContext.getWorkingProject();
        return (workingProj != undefined && workingProj.getName() == project.getName());
    }

    /**
     * TABLE SORT MANAGEMENT
     */

    private openTableConfig() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('sm').toJSON() };
        this.modal.open(ProjectTableConfigModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => {
                    this.initTable();
                }
            )
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
            // console.log("inserting idx", idxCellFrom, "(", td.item(idxCellFrom), ")", "before idx", idxCellTo, td.item(idxCellTo));
            td.item(idxCellFrom).parentNode.insertBefore(td.item(idxCellFrom), td.item(idxCellTo));
        }
    }

}