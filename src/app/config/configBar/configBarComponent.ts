import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { VersionInfo } from "../../models/History";
import { Project } from "../../models/Project";
import { ProjectListModal } from '../../project/projectListModal';
import { AdministrationServices } from "../../services/administrationServices";
import { InputOutputServices } from "../../services/inputOutputServices";
import { PreferencesSettingsServices } from "../../services/preferencesSettingsServices";
import { ProjectServices } from "../../services/projectServices";
import { ShaclServices } from "../../services/shaclServices";
import { LoadShapesModal } from "../../shacl/loadShapesModal";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "config-bar",
    templateUrl: "./configBarComponent.html",
})
export class ConfigBarComponent {

    private currentProject: Project;

    private privacyStatementAvailable: boolean = false;
    private shaclEnabled: boolean = false;

    private loadDataAuthorized: boolean;
    private exportDataAuthorized: boolean;
    private clearDataAuthorized: boolean;
    private versioningAuthorized: boolean;
    private loadShapesAuthorized: boolean;
    private exportShapesAuthorized: boolean;
    private clearShapesAuthorized: boolean;

    constructor(private inOutService: InputOutputServices, private projectService: ProjectServices, private prefService: PreferencesSettingsServices,
        private administrationService: AdministrationServices, private shaclService: ShaclServices, private vbProp: VBProperties, 
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

    /* ===============================
     * Project selection
     * =============================== */

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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(ProjectListModal, overlayConfig);
    }

    /* ===============================
     * About menu
     * =============================== */

    /**
     * Initializes privacyStatementAvailable. This methods is invoked each time the "About VocBench" menu is open.
     * This is necessary since if privacyStatementAvailable is initialized in ngOnInit(), the system setting migth still not retrieved
     * (in AppComponent.ngOnInit())
     */
    private onAboutMenuOpen() {
        this.privacyStatementAvailable = this.vbProp.isPrivacyStatementAvailable();
    }
    private downloadPrivacyStatement() {
        this.administrationService.downloadPrivacyStatement().subscribe();
    }

    /* ===============================
     * Global data management
     * =============================== */

    /**
     * Invoke the initialization of the authorizations of the global data management menu items.
     * This is performed each time the menu is open in order to prevent repeated checks even when not necessary
     */
    private onGlobalDataManagementMenuOpen() {
        this.initAuth();
        this.shaclEnabled = VBContext.getWorkingProject().isShaclEnabled();
    }

    private clearData() {
        this.basicModals.confirm("Clear data", "This operation will erase all the data stored in the project." +
            " The project will be closed and then you will be redirect to the projects page." +
            " Are you sure to proceed?", "warning").then(
            () => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.inOutService.clearData().subscribe(
                    stResp => {
                        this.prefService.setActiveSchemes().subscribe();
                        this.basicModals.alert("Clear data", "All data cleared successfully.");
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

    loadShacleShapes() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(LoadShapesModal, overlayConfig);
    }

    exportShacleShapes() {
        this.shaclService.exportShapes().subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink("Export SHACL shapes", null, exportLink, "shapes.ttl");
            }
        )
    }

    clearShacleShapes() {
        this.basicModals.confirm("Clear SHACL shapes", "This operation will delete all the SHACL shapes stored in the project. Are you sure to proceed?",
            "warning").then(
            () => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.shaclService.clearShapes().subscribe(
                    () => {
                        this.basicModals.alert("Clear SHACL shapes", "All SHACL shapes cleared successfully.");
                    }
                );
            },
            () => { }
        );
    }

    /* ===============================
     * AUTH
     * =============================== */

    /**
     * Initializes the authorizations of the global data management menu items
     */
    private initAuth() {
        this.loadDataAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.inputOutputLoadData);
        this.exportDataAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.exportExport);
        this.clearDataAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.inputOutputClearData);
        this.versioningAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.versionsGetVersions);
        this.loadShapesAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.shaclLoadShapes);
        this.exportShapesAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.shaclExportShapes);
        this.clearShapesAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.shaclClearShapes);
    }

}