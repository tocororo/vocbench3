import { Injectable } from '@angular/core';
import { VBContext } from "./VBContext";
import { User } from "../models/User";

enum Actions {
    CLASSES_CREATE_CLASS,
    CLASSES_CREATE_INDIVIDUAL,
    CLASSES_DELETE_CLASS,
    CLASSES_DELETE_INDIVIDUAL,
    PROPERTIES_CREATE_PROPERTY,
    PROPERTIES_DELETE_PROPERTY,
    SKOS_CREATE_COLLECTION,
    SKOS_CREATE_CONCEPT,
    SKOS_CREATE_SCHEME,
    SKOS_DELETE_COLLECTION,
    SKOS_DELETE_CONCEPT,
    SKOS_DELETE_SCHEME,
}

export class AuthorizationEvaluator {

    public static Actions = Actions;

    private static actionAuthGoalMap = {
        [Actions.CLASSES_CREATE_CLASS] : "auth('rdf(cls)', 'C').",
        [Actions.CLASSES_CREATE_INDIVIDUAL] : "auth('rdf(individual)', 'C').",
        [Actions.CLASSES_DELETE_CLASS] : "auth('rdf(cls)', 'D').",
        [Actions.CLASSES_DELETE_INDIVIDUAL] : "auth('rdf(individual)', 'D').",
        [Actions.PROPERTIES_CREATE_PROPERTY] : "auth('rdf(property)', 'C').",
        [Actions.PROPERTIES_DELETE_PROPERTY] : "auth('rdf(property)', 'D').",
        [Actions.SKOS_CREATE_COLLECTION] : "auth('rdf(skosCollection)', 'C').",
        [Actions.SKOS_CREATE_CONCEPT] : "auth('rdf(concept)', 'C').",
        [Actions.SKOS_CREATE_SCHEME] : "auth('rdf(conceptScheme)', 'C').",
        [Actions.SKOS_DELETE_COLLECTION] : "auth('rdf(skosCollection)', 'D').",
        [Actions.SKOS_DELETE_CONCEPT] : "auth('rdf(concept)', 'D').",
        [Actions.SKOS_DELETE_SCHEME] : "auth('rdf(conceptScheme)', 'D')."
    };
    
    public static isAuthorized(action: Actions): boolean {
        // console.log("evaluating", this.actionAuthGoalMap[action]);
        // console.log("user capabilities", VBContext.getLoggedUser().getCapabilities());
        var user: User = VBContext.getLoggedUser()
        if (user.isAdmin()) {
            return true;
        } else {
            //evaluate if the user capabilities satisfy the authorization requirement
            return true;
        }
    }

}