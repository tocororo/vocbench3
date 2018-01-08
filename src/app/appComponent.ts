import { Component } from "@angular/core";
import { Project } from "./models/Project";
import { SKOS, OWL, RDFS } from "./models/Vocabulary";
import { Language, Languages } from "./models/LanguagesCountries";
import { VBContext } from "./utils/VBContext";
import { AuthorizationEvaluator } from "./utils/AuthorizationEvaluator";
import { BasicModalServices } from "./widget/modal/basicModal/basicModalServices";
import { PreferencesSettingsServices } from "./services/preferencesSettingsServices";

import '../assets/styles/style.css';

@Component({
    selector: "app",
    templateUrl: "./appComponent.html",
})

export class AppComponent {

    constructor(private prefSettingService: PreferencesSettingsServices, private basicModals: BasicModalServices) {}

    ngOnInit() {
        if (Languages.getSystemLanguages() == null) {
            Languages.initSystemLanguage(this.prefSettingService, this.basicModals);
        }
    }

    /**
     * Returns true if the user is logged (an authentication token is stored)
     * Useful to show/hide menubar link
     */
    private isUserLogged(): boolean {
        return VBContext.isLoggedIn();
    }

    private isUserAdmin(): boolean {
        return VBContext.getLoggedUser().isAdmin();
    }

    /**
     * returns true if a project is open. Useful to show/hide menubar links
     */
    private isProjectOpen(): boolean {
        return VBContext.getWorkingProject() != undefined;
    }

    /**
     * Returns true if the current open project has history enabled
     */
    private isProjectHistoryEnabled(): boolean {
        var wProj: Project = VBContext.getWorkingProject();
        if (wProj != undefined) {
            return wProj.isHistoryEnabled();
        }
        return false;
    }

    /**
     * Returns true if the current open project has validation enabled
     */
    private isProjectValidationEnabled(): boolean {
        var wProj: Project = VBContext.getWorkingProject();
        if (wProj != undefined) {
            return wProj.isValidationEnabled();
        }
        return false;
    }

    /**
     * Authorizations
     */

    private isSparqlAuthorized() {
        return ( //authorized if one of update or query is authorized
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SPARQL_EVALUATE_QUERY) ||
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SPARQL_EXECUTE_UPDATE)
        );
    }
    
    private isDataAuthorized() {
        let modelType: string = VBContext.getWorkingProject().getModelType();
        if (modelType == SKOS.uri) {
            return (
                AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_CONCEPT_TAXONOMY) ||
                AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_COLLECTION_TAXONOMY) ||
                AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SKOS_GET_SCHEMES) ||
                AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.CLASSES_GET_CLASS_TAXONOMY) ||
                AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.PROPERTIES_GET_PROPERTY_TAXONOMY)
            );
        } else if (modelType == OWL.uri || modelType == RDFS.uri) {
            return (
                AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.CLASSES_GET_CLASS_TAXONOMY) ||
                AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.PROPERTIES_GET_PROPERTY_TAXONOMY)
            );
        }
    }

    private isHistoryAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.HISTORY) &&
            VBContext.getContextVersion() == null
        );
    }
    
    private isValidationAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.VALIDATION) &&
            VBContext.getContextVersion() == null
        );
    }
    
    private isCustomFormAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.CUSTOM_FORMS_GET_FORM_MAPPINGS) &&
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.CUSTOM_FORMS_GET_COLLECTIONS) &&
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.CUSTOM_FORMS_GET_FORMS)
        );
    }
    
    private isAlignValidationAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ALIGNMENT_LOAD_ALIGNMENT);
    }

}