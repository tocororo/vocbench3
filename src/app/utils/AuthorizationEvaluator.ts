import { Injectable } from '@angular/core';
import { VBContext } from "./VBContext";
import { User } from "../models/User";
import { ARTResource } from "../models/ARTResources";

enum Actions {
    ALIGNMENT_ADD_ALIGNMENT,
    CLASSES_CREATE_CLASS,
    CLASSES_CREATE_INDIVIDUAL,
    CLASSES_DELETE_CLASS,
    CLASSES_DELETE_INDIVIDUAL,
    PROPERTIES_CREATE_PROPERTY,
    PROPERTIES_DELETE_PROPERTY,
    REFACTOR_CHANGE_RESOURCE_URI,
    REFACTOR_SPAWN_NEW_CONCEPT_FROM_LABEL,
    RESOURCES_SET_DEPRECATED,
    SKOS_CREATE_COLLECTION,
    SKOS_CREATE_CONCEPT,
    SKOS_CREATE_SCHEME,
    SKOS_DELETE_COLLECTION,
    SKOS_DELETE_CONCEPT,
    SKOS_DELETE_SCHEME,
}

export class AuthorizationEvaluator {

    private static resRole: string = "%resource_role%";

    public static Actions = Actions;

    private static actionAuthGoalMap = {
        [Actions.ALIGNMENT_ADD_ALIGNMENT] : "auth('rdf(" + AuthorizationEvaluator.resRole + ", alignment)', 'C').",
        [Actions.CLASSES_CREATE_CLASS] : "auth('rdf(cls)', 'C').",
        [Actions.CLASSES_CREATE_INDIVIDUAL] : "auth('rdf(individual)', 'C').",
        [Actions.CLASSES_DELETE_CLASS] : "auth('rdf(cls)', 'D').",
        [Actions.CLASSES_DELETE_INDIVIDUAL] : "auth('rdf(individual)', 'D').",
        [Actions.PROPERTIES_CREATE_PROPERTY] : "auth('rdf(property)', 'C').",
        [Actions.PROPERTIES_DELETE_PROPERTY] : "auth('rdf(property)', 'D').",
        [Actions.REFACTOR_CHANGE_RESOURCE_URI] : "auth('rdf(" + AuthorizationEvaluator.resRole + ")', 'U').",
        [Actions.REFACTOR_SPAWN_NEW_CONCEPT_FROM_LABEL] : "auth('rdf(concept)', 'C').",
        [Actions.RESOURCES_SET_DEPRECATED] : "auth('rdf(" + AuthorizationEvaluator.resRole + ")', 'U')",
        [Actions.SKOS_CREATE_COLLECTION] : "auth('rdf(skosCollection)', 'C').",
        [Actions.SKOS_CREATE_CONCEPT] : "auth('rdf(concept)', 'C').",
        [Actions.SKOS_CREATE_SCHEME] : "auth('rdf(conceptScheme)', 'C').",
        [Actions.SKOS_DELETE_COLLECTION] : "auth('rdf(skosCollection)', 'D').",
        [Actions.SKOS_DELETE_CONCEPT] : "auth('rdf(concept)', 'D').",
        [Actions.SKOS_DELETE_SCHEME] : "auth('rdf(conceptScheme)', 'D')."
    };
    
    /**
     * 
     * @param action 
     * @param resource If provided, is used to get its role 
     */
    public static isAuthorized(action: Actions, resource?: ARTResource): boolean {
        var user: User = VBContext.getLoggedUser()
        if (user.isAdmin()) {
            return true;
        } else {
            //evaluate if the user capabilities satisfy the authorization requirement
            let goal: string = this.actionAuthGoalMap[action];

            if (goal.includes(AuthorizationEvaluator.resRole)) {
                if (resource != null) {
                    goal = goal.replace(AuthorizationEvaluator.resRole, resource.getRole());
                } else {
                    return false;
                }
            }
            
            console.log("evaluating", goal);
            console.log("user capabilities", VBContext.getLoggedUser().getCapabilities());
            return true;
        }
    }

}