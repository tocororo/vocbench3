import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { VersionInfo } from "../../models/History";
import { Project } from "../../models/Project";
import { ProjectListModal } from '../../project/projectListModal';
import { InputOutputServices } from "../../services/inputOutputServices";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { ProjectServices } from "../../services/projectServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "config-bar",
    templateUrl: "./configBarComponent.html",
})
export class ConfigBarComponent {

    private currentProject: Project;

    constructor(private inOutService: InputOutputServices, private projectService: ProjectServices, 
        private prefService: PreferencesSettingsServices, private basicModals: BasicModalServices, 
        private router: Router, private modal: Modal) {
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

    private isLoadDataAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.inputOutputLoadData);
    }
    private isExportDataAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.exportExport);
    }
    private isClearDataAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.inputOutputClearData);
    }
    private isVersioningAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.versionsGetVersions);
    }

    /**
     * Opens a modal that allows to change project among the open
     */
    private changeProject() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(ProjectListModal, overlayConfig);
    }

    private clearData() {
        this.basicModals.confirm("Clear data", "This operation will erase all the data stored in the project." +
            " The project will be closed and then you will be redirect to the projects page." +
            " Are you sure to proceed?", "warning").then(
            (result: any) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.inOutService.clearData().subscribe(
                    stResp => {
                        this.prefService.setActiveSchemes().subscribe();
                        this.basicModals.alert("Clear data", "All data cleared successfully!");
                        this.projectService.disconnectFromProject(VBContext.getWorkingProject()).subscribe(
                            stResp => {
                                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                //then redirect to Projects page
                                if (this.router.url == "/Projects") {
                                    this.router.navigate(['/Home']).then(
                                        success => {
                                            this.router.navigate(['/Projects']);
                                        }
                                    );    
                                } else {
                                    this.router.navigate(['/Projects']);
                                }
                                
                            }
                        );
                    }
                );
            },
            () => { }
        );
    }

}