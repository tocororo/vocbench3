import { Component } from "@angular/core";
import { Project } from "./models/Project";
import { VBContext } from "./utils/VBContext";
import { AuthorizationEvaluator } from "./utils/AuthorizationEvaluator";

import '../assets/styles/style.css';

@Component({
    selector: "app",
    templateUrl: "./appComponent.html",
})

export class AppComponent {

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
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.SPARQL_EXECUTE_QUERY);
    }
    private isCustomFormAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.CUSTOM_FORMS_READ);
    }
    private isAlignValidationAuthorized() {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ALIGNMENT_LOAD_ALIGNMENT);
    }

}