import { Component, HostListener } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { Project, ProjectLabelCtx } from "./models/Project";
import { OperationMetadata } from "./models/Undo";
import { EDOAL, OntoLex, OWL, RDFS, SKOS } from "./models/Vocabulary";
import { UndoServices } from "./services/undoServices";
import { AuthorizationEvaluator } from "./utils/AuthorizationEvaluator";
import { Cookie } from './utils/Cookie';
import { VBActionsEnum } from "./utils/VBActions";
import { VBContext } from "./utils/VBContext";
import { VBEventHandler } from './utils/VBEventHandler';
import { VBProperties } from "./utils/VBProperties";
import { ToastService } from "./widget/toast/toastService";

@Component({
    selector: "app",
    templateUrl: "./appComponent.html",
})
export class AppComponent {

    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent) {
        if (e.ctrlKey && e.key == "z") {
            this.undoHandler();
        }
    }

    appVersion = require('../../package.json').version;

    navbarCollapsed: boolean;

    navbarTheme: number = 0;

    constructor(private vbProp: VBProperties, private undoService: UndoServices, private toastService: ToastService,
        private eventHandler: VBEventHandler, translate: TranslateService) {
        this.eventHandler.themeChangedEvent.subscribe((theme: number) => {
            if (theme != null) {
                this.navbarTheme = theme;
            } else {
                this.navbarTheme = 0;
            }
        });

        //set the available factory-provided l10n languages
        translate.addLangs(['de', 'en', 'it']);
        //add additional supported l10n languages
        let additionalLangs: string[] = window['additional_l10n_langs'];
        if (additionalLangs && additionalLangs.length > 0) {
            translate.addLangs(additionalLangs);
        }
        //fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');
        //restore the lang to use, check first the cookies, if not found or not among the supported, set english by default
        let transLang: string = Cookie.getCookie(Cookie.TRANSLATE_LANG);
        if (transLang == null || !translate.getLangs().includes(transLang)) {
            transLang = "en";
        }
        translate.use(transLang);
        ProjectLabelCtx.language = transLang; //init lang for project rendering

    }

    ngOnInit() {
        this.vbProp.initStartupSystemSettings();
    }

    /**
     * Returns true if the user is logged (an authentication token is stored)
     * Useful to show/hide menubar link
     */
    isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

    isUserAdmin(): boolean {
        return VBContext.getLoggedUser().isAdmin();
    }

    /**
     * returns true if a project is open. Useful to show/hide menubar links
     */
    isProjectOpen(): boolean {
        return VBContext.getWorkingProject() != undefined;
    }

    isProjectEdoal(): boolean {
        return VBContext.getWorkingProject().getModelType() == EDOAL.uri;
    }

    /**
     * Returns true if the current open project has history enabled
     */
    isProjectHistoryEnabled(): boolean {
        var wProj: Project = VBContext.getWorkingProject();
        if (wProj != undefined) {
            return wProj.isHistoryEnabled();
        }
        return false;
    }

    /**
     * Returns true if the current open project has validation enabled
     */
    isProjectValidationEnabled(): boolean {
        var wProj: Project = VBContext.getWorkingProject();
        if (wProj != undefined) {
            return wProj.isValidationEnabled();
        }
        return false;
    }

    /**
     * Authorizations
     */

    isSparqlAuthorized() {
        return ( //authorized if one of update or query is authorized
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.sparqlEvaluateQuery) ||
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.sparqlExecuteUpdate)
        );
    }

    isDataAuthorized() {
        let modelType: string = VBContext.getWorkingProject().getModelType();
        if (modelType == EDOAL.uri) {
            return true; //Edoal projects has no capabilities required????
        } else if (modelType == SKOS.uri || modelType == OntoLex.uri) {
            return (
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetConceptTaxonomy) ||
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetCollectionTaxonomy) ||
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetSchemes) ||
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesGetClassTaxonomy) ||
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetPropertyTaxonomy)
            );
        } else if (modelType == OWL.uri || modelType == RDFS.uri) {
            return (
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesGetClassTaxonomy) ||
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetPropertyTaxonomy)
            );
        }
    }

    isMetadataVocAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.datasetMetadataExport) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.datasetMetadataGetMetadata)
        );
    }

    isMetadataRegistryAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryRead);
    }

    isHistoryAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.history) &&
            VBContext.getContextVersion() == null
        );
    }

    isValidationAuthorized() {
        //all user are allowed to see Validation page, further auth checks (is user a validator?) are performed in the Validation page
        return VBContext.getContextVersion() == null;

    }

    isCustomFormAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormGetFormMappings) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormGetCollections) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormGetForms)
        );
    }

    isAlignValidationAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.alignmentLoadAlignment) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.alignmentApplyAlignment);
    }

    isSheet2RdfAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.sheet2Rdf);
    }

    isCollaborationAuthorized() {
        return true;
    }

    isResourceMetadataAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourceMetadataPatternRead) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourceMetadataAssociationRead);
    }

    isCustomServicesAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.customServiceRead) ||
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterRead)
        );
    }

    isSkosDiffingAuthorized() {
        return (
            VBContext.getWorkingProject().getModelType() == SKOS.uri
        );
    }

    private undoHandler() {
        let project = VBContext.getWorkingProject();

        //if no project is accessed do nothing
        if (project == null) return;

        //if accessed project has neither history or validation enabled, do nothing
        if (!project.isHistoryEnabled() && !project.isValidationEnabled()) return;

        //perform UNDO only if active element is not a textarea or input (with type text)
        let activeEl: Element = document.activeElement;
        let tagName: string = activeEl.tagName.toLowerCase()
        if (tagName != "textarea" && (tagName != "input" || activeEl.getAttribute("type") != "text")) {
            this.undoService.undo().subscribe(
                (metadata: OperationMetadata) => {
                    this.toastService.show({ title: "Operation undone", message: "You have undone the current operation: " + metadata }, { toastClass: "bg-warning", delay: 3000 });
                }
            );
        }

    }

}