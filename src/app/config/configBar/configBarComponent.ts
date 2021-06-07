import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ARTResource } from "src/app/models/ARTResources";
import { ExportServices } from "src/app/services/exportServices";
import { ShaclBatchValidationModal } from "src/app/shacl/shaclBatchValidationModal";
import { Cookie } from 'src/app/utils/Cookie';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { VersionInfo } from "../../models/History";
import { Project, ProjectLabelCtx } from "../../models/Project";
import { AdministrationServices } from "../../services/administrationServices";
import { InputOutputServices } from "../../services/inputOutputServices";
import { ShaclServices } from "../../services/shaclServices";
import { LoadShapesModal } from "../../shacl/loadShapesModal";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "config-bar",
    templateUrl: "./configBarComponent.html",
})
export class ConfigBarComponent {

    currentProject: Project;

    privacyStatementAvailable: boolean = false;
    shaclEnabled: boolean = false;

    translateLangs: string[];
    translateLang: string;

    loadDataAuthorized: boolean;
    exportDataAuthorized: boolean;
    clearDataAuthorized: boolean;
    versioningAuthorized: boolean;
    wgraphAuthorized: boolean;
    loadShapesAuthorized: boolean;
    exportShapesAuthorized: boolean;
    clearShapesAuthorized: boolean;
    shaclBatchValidationAuthorized: boolean;

    constructor(private exportServices: ExportServices, private inOutService: InputOutputServices,
        private administrationService: AdministrationServices, private shaclService: ShaclServices, private vbProp: VBProperties, 
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal,
        private translate: TranslateService, private route: Router) {
    }

    ngOnInit() {
        this.translateLangs = this.translate.getLangs();
        this.translateLang = this.translate.currentLang;
    }

    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */
    isProjectAccessed(): boolean {
        this.currentProject = VBContext.getWorkingProject();
        return VBContext.getWorkingProject() != undefined;
    }

    /**
     * Returns true if the user is logged (an authentication token is stored).
     */
    isUserLogged(): boolean {
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
     * Returns the current write graph of the project 
     */
    private getCtxWGraph(): ARTResource {
        return VBContext.getContextWGraph();
    }

    /**
     * Opens a modal that allows to change project among the open
     */
    private changeProject() {
        this.sharedModals.changeProject();
    }

    /* ===============================
     * About menu
     * =============================== */

    /**
     * Initializes privacyStatementAvailable. This methods is invoked each time the "About VocBench" menu is open.
     * This is necessary since if privacyStatementAvailable is initialized in ngOnInit(), the system setting migth still not retrieved
     * (in AppComponent.ngOnInit())
     */
    onAboutMenuOpen() {
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
    onGlobalDataManagementMenuOpen() {
        this.initAuth();
        this.shaclEnabled = VBContext.getWorkingProject().isShaclEnabled();
    }

    clearData() {
        this.basicModals.confirm({key:"ACTIONS.CLEAR_DATA"}, {key: "MESSAGES.CLEAR_DATA_CONFIRM"}, ModalType.warning).then(
            () => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.inOutService.clearData().subscribe(
                    () => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert({key:"ACTIONS.CLEAR_DATA"}, {key:"MESSAGES.DATA_CLEARED"});
                        //reset scheme in order to prevent error when re-init the concept tree
                        this.vbProp.setActiveSchemes(VBContext.getWorkingProjectCtx(), []);
                        //simulate the project change in order to force the destroy of all the Route
                        VBContext.setProjectChanged(true);
                        //redirect to the home in order to prevent any kind of error related to not existing resource
                        this.route.navigate(["/Home"]);
                    }
                );
            },
            () => { }
        );
    }

    changeWGraph() {
        this.exportServices.getNamedGraphs().subscribe(
            graphs => {
                this.sharedModals.selectResource({key: "APP.TOP_BAR.GLOBAL_DATA_MENU.WGRAPH"}, null, graphs, false).then(g => {
                    if (VBContext.getWorkingProject()?.getBaseURI() == g.getNominalValue()) {
                        g = null;
                    }
                    VBContext.setContextWGraph(g);
                    VBContext.setProjectChanged(true); //changing wgraph is equivalent to changing projectv
                    //redirect to the home in order to reset views that were based on the old wgraph
                    this.route.navigate(["/Home"]);
                }, () => { });
            }
        )
    }

    loadShacleShapes() {
        this.modalService.open(LoadShapesModal, new ModalOptions());
    }

    exportShacleShapes() {
        this.shaclService.exportShapes().subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink({ key: "SHACL.EXPORT_SHACL_SHAPES" }, null, exportLink, "shapes.ttl");
            }
        )
    }

    clearShacleShapes() {
        this.basicModals.confirm({ key: "SHACL.CLEAR_SHACL_SHAPES" }, "This operation will delete all the SHACL shapes stored in the project. Are you sure to proceed?",
            ModalType.warning).then(
            () => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.shaclService.clearShapes().subscribe(
                    () => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert({ key: "SHACL.CLEAR_SHACL_SHAPES" }, {key:"MESSAGES.SHACL_SHAPES_CLEARED"});
                    }
                );
            },
            () => { }
        );
    }

    batchShaclValidation() {
        this.modalService.open(ShaclBatchValidationModal, new ModalOptions());
    }

    onTranslateLangChanged() {
        this.translate.use(this.translateLang);
        Cookie.setCookie(Cookie.TRANSLATE_LANG, this.translateLang);
        ProjectLabelCtx.language = this.translateLang;
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
        this.wgraphAuthorized = AuthorizationEvaluator.isGaolAuthorized('auth(rdf(graph), "U").'); //goal written directly since this has no corresponding action, just changes wgraph in VBContext
        this.loadShapesAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.shaclLoadShapes);
        this.exportShapesAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.shaclExportShapes);
        this.clearShapesAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.shaclClearShapes);
        this.shaclBatchValidationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.shaclBatchValidation);
    }

}