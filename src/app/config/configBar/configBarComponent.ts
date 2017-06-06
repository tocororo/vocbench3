import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { ProjectListModal } from '../../project/projectListModal';
import { Project, ProjectTypesEnum } from "../../models/Project";
import { VersionInfo } from "../../models/History";
import { InputOutputServices } from "../../services/inputOutputServices";
import { ProjectServices } from "../../services/projectServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "config-bar",
    templateUrl: "./configBarComponent.html",
})
export class ConfigBarComponent {

    private currentProject: Project;

    constructor(private inOutService: InputOutputServices, private projectService: ProjectServices, 
        private basicModals: BasicModalServices, private router: Router, private modal: Modal) {
    }

    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */
    private isProjectAccessed(): boolean {
        this.currentProject = VBContext.getWorkingProject();
        return VBContext.getWorkingProject() != undefined;
    }

    /**
     * Returns true if the user is logged (an authentication token is stored).
     */
    private isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

    /**
     * Returns the current version of the project
     */
    private getCtxVersion(): VersionInfo {
        return VBContext.getContextVersion();
    }

    /**
     * Opens a modal that allows to change project among the open
     */
    private changeProject() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(ProjectListModal, overlayConfig);
    }

    private clearData() {
        this.basicModals.confirm("Clear data", "This operation will erase all the data stored in the project." +
            " The project will be closed and then you will be redirect to the projects page." +
            " Are you sure to proceed?", "warning").then(
            result => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.inOutService.clearData().subscribe(
                    stResp => {
                        this.basicModals.alert("Clear data", "All data cleared successfully!");
                        //if project is not-persistent save it before closing
                        if (VBContext.getWorkingProject().getType() == ProjectTypesEnum.saveToStore) {
                            this.projectService.saveProject(VBContext.getWorkingProject()).subscribe(
                                stResp => {
                                    //then close project
                                    this.projectService.disconnectFromProject(VBContext.getWorkingProject()).subscribe(
                                        stResp => {
                                            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                            //then redirect to home page
                                            this.router.navigate(['/Projects']);
                                        }
                                    );
                                }
                            )
                        } else {
                            //project is presistent, it doesn't need to be saved, just close the project
                            this.projectService.disconnectFromProject(VBContext.getWorkingProject()).subscribe(
                                stResp => {
                                    UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                    //then redirect to home page
                                    this.router.navigate(['/Projects']);
                                }
                            );
                        }
                    }
                );
            },
            () => { }
        );
    }

}