import { Component } from "@angular/core";
import '../assets/styles/style.css';
import { Project } from "./models/Project";
import { EDOAL, OntoLex, OWL, RDFS, SKOS } from "./models/Vocabulary";
import { AuthorizationEvaluator } from "./utils/AuthorizationEvaluator";
import { VBActionsEnum } from "./utils/VBActions";
import { VBContext } from "./utils/VBContext";
import { VBProperties } from "./utils/VBProperties";


@Component({
    selector: "app",
    templateUrl: "./appComponent.html",
})

export class AppComponent {

    private appVersion = require('../../package.json').version;

    constructor(private vbProp: VBProperties) {}

    ngOnInit() {
        this.vbProp.initStartupSystemSettings();
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

    private isProjectEdoal(): boolean {
        return VBContext.getWorkingProject().getModelType() == EDOAL.uri;
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
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.sparqlEvaluateQuery) ||
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.sparqlExecuteUpdate)
        );
    }
    
    private isDataAuthorized() {
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

    private isMetadataVocAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.datasetMetadataExport) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.datasetMetadataGetMetadata)
        );
    }

    private isMetadataRegistryAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryRead);
    }

    private isHistoryAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.history) &&
            VBContext.getContextVersion() == null
        );
    }
    
    private isValidationAuthorized() {
        //all user are allowed to see Validation page, further auth checks (is user a validator?) are performed in the Validation page
        return VBContext.getContextVersion() == null;
        
    }
    
    private isCustomFormAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormGetFormMappings) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormGetCollections) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormGetForms)
        );
    }
    
    private isAlignValidationAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.alignmentLoadAlignment);
    }

    private isSheet2RdfAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.sheet2Rdf);
    }

    private isCollaborationAuthorized() {
        return true;
    }

    private isResourceMetadataAuthorized() {
        return true; //waiting for authorization
    }

    private isCustomServicesAuthorized() {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.customServiceRead) ||
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterRead)
        );
    }

}