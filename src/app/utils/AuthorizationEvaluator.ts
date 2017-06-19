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
    INDIVIDUALS_ADD_TYPE,
    PROPERTIES_ADD_PROPERTY_DOMAIN,
    PROPERTIES_ADD_PROPERTY_RANGE,
    PROPERTIES_ADD_SUPERPROPERTY,
    PROPERTIES_CREATE_PROPERTY,
    PROPERTIES_DELETE_PROPERTY,
    REFACTOR_CHANGE_RESOURCE_URI,
    REFACTOR_SPAWN_NEW_CONCEPT_FROM_LABEL,
    RESOURCES_ADD_VALUE,
    RESOURCES_SET_DEPRECATED,
    SKOS_ADD_BROADER_CONCEPT,
    SKOS_ADD_CONCEPT_TO_SCHEME,
    SKOS_ADD_LEXICALIZATION,
    SKOS_ADD_TO_COLLECTION,
    SKOS_ADD_TOP_CONCEPT,
    SKOS_CREATE_COLLECTION,
    SKOS_CREATE_CONCEPT,
    SKOS_CREATE_SCHEME,
    SKOS_DELETE_COLLECTION,
    SKOS_DELETE_CONCEPT,
    SKOS_DELETE_SCHEME,
    SKOS_REMOVE_BROADER_CONCEPT,
}

export class AuthorizationEvaluator {

    private static resRole: string = "%resource_role%";

    public static Actions = Actions;

    private static actionAuthGoalMap: { [x: number ]: { goal: string, cachedAuth: boolean} } = {
        [Actions.ALIGNMENT_ADD_ALIGNMENT] : {
            goal: "auth('rdf(" + AuthorizationEvaluator.resRole + ", alignment)', 'C').", cachedAuth: null 
        },
        [Actions.CLASSES_CREATE_CLASS] : {
            goal: "auth('rdf(cls)', 'C').", cachedAuth: null
        },
        [Actions.CLASSES_CREATE_INDIVIDUAL] : {
            goal: "auth('rdf(individual)', 'C').", cachedAuth: null
        },
        [Actions.CLASSES_DELETE_CLASS] : {
            goal: "auth('rdf(cls)', 'D').", cachedAuth: null
        },
        [Actions.CLASSES_DELETE_INDIVIDUAL] : { 
            goal: "auth('rdf(individual)', 'D').", cachedAuth: null
        },
        [Actions.INDIVIDUALS_ADD_TYPE] : { 
            goal: "auth('rdf(" + AuthorizationEvaluator.resRole + ")', 'U').", cachedAuth: null
        },
        [Actions.PROPERTIES_ADD_PROPERTY_DOMAIN] : { 
            goal: "auth('rdf(property)', 'C').", cachedAuth: null
        },
        [Actions.PROPERTIES_ADD_PROPERTY_RANGE] : { 
            goal: "auth('rdf(property)', 'C').", cachedAuth: null
        },
        [Actions.PROPERTIES_ADD_SUPERPROPERTY] : { 
            goal: "auth('rdf(property)', 'C').", cachedAuth: null
        },
        [Actions.PROPERTIES_CREATE_PROPERTY] : { 
            goal: "auth('rdf(property)', 'C').", cachedAuth: null 
        },
        [Actions.PROPERTIES_DELETE_PROPERTY] : { 
            goal: "auth('rdf(property)', 'D').", cachedAuth: null 
        },
        [Actions.REFACTOR_CHANGE_RESOURCE_URI] : { 
            goal: "auth('rdf(" + AuthorizationEvaluator.resRole + ")', 'U').", cachedAuth: null
        },
        [Actions.REFACTOR_SPAWN_NEW_CONCEPT_FROM_LABEL] : { 
            goal: "auth('rdf(concept)', 'C').", cachedAuth: null 
        },
        [Actions.RESOURCES_ADD_VALUE] : { 
            goal: "auth('rdf(" + AuthorizationEvaluator.resRole + ", values)', 'C')", cachedAuth: null 
        },
        [Actions.RESOURCES_SET_DEPRECATED] : { 
            goal: "auth('rdf(" + AuthorizationEvaluator.resRole + ")', 'U')", cachedAuth: null 
        },
        [Actions.SKOS_ADD_BROADER_CONCEPT] : { 
            goal: "auth('rdf(concept, taxonomy)', 'C').", cachedAuth: null 
        },
        [Actions.SKOS_ADD_CONCEPT_TO_SCHEME] : { 
            goal: "auth('rdf(concept, schemes)', 'C').", cachedAuth: null 
        },
        [Actions.SKOS_ADD_LEXICALIZATION] : { 
            goal: "auth('rdf(concept, lexicalization)', 'C').", cachedAuth: null 
        }, //TODO check if detect role dinamically
        [Actions.SKOS_ADD_TO_COLLECTION] : { 
            goal: "auth('rdf(skosCollection)', 'C').", cachedAuth: null 
        }, //TODO is it ok?
        [Actions.SKOS_ADD_TOP_CONCEPT] : { 
            goal: "auth('rdf(concept, schemes)', 'C').", cachedAuth: null 
        },
        [Actions.SKOS_CREATE_COLLECTION] : { 
            goal: "auth('rdf(skosCollection)', 'C').", cachedAuth: null 
        },
        [Actions.SKOS_CREATE_CONCEPT] : { 
            goal: "auth('rdf(concept)', 'C').", cachedAuth: null 
        },
        [Actions.SKOS_CREATE_SCHEME] : { 
            goal: "auth('rdf(conceptScheme)', 'C').", cachedAuth: null 
        },
        [Actions.SKOS_DELETE_COLLECTION] : { 
            goal: "auth('rdf(skosCollection)', 'D').", cachedAuth: null 
        },
        [Actions.SKOS_DELETE_CONCEPT] : { 
            goal: "auth('rdf(concept)', 'D').", cachedAuth: null 
        },
        [Actions.SKOS_DELETE_SCHEME] : { 
            goal: "auth('rdf(conceptScheme)', 'D').", cachedAuth: null 
        },
        [Actions.SKOS_REMOVE_BROADER_CONCEPT] : { 
            goal: "auth('rdf(concept, taxonomy)', 'D').",  cachedAuth: null
        }
    };
    
    /**
     * @param action 
     * @param resource If provided, is used to get its role 
     */
    public static isAuthorized(action: Actions, resource?: ARTResource): boolean {
        var user: User = VBContext.getLoggedUser()
        if (user.isAdmin()) {
            return true;
        } else {
            //evaluate if the user capabilities satisfy the authorization requirement
            let goal: string = this.actionAuthGoalMap[action].goal;
            let cachedAuth: boolean = this.actionAuthGoalMap[action].cachedAuth;
            if (cachedAuth != null) { //if it was chached => return it
                console.log("authorization cached", cachedAuth);
                return cachedAuth;
            } else { //...otherwise compute authorization
                //dynamic goal (depending on resource role)
                if (goal.includes(AuthorizationEvaluator.resRole)) {
                    if (resource != null) {
                        goal = goal.replace(AuthorizationEvaluator.resRole, resource.getRole());
                        //compute authorization and don't cache the result (since it depends on resource role)
                        let authorized: boolean = this.evaulatePrologGoal(goal);
                        return authorized;
                    } else {
                        throw new Error("Cannot resolve the authorization goal: goal depends on resource role, but resource is undefined");
                    }
                } else { //static goal
                    let authorized: boolean = this.evaulatePrologGoal(goal);
                    this.actionAuthGoalMap[action].cachedAuth = authorized; //cache the result of the evaluation
                    return authorized;
                }
            }
        }
    }

    private static evaulatePrologGoal(goal: string): boolean {
        console.log("evaluating", goal);
        console.log("user capabilities", VBContext.getLoggedUser().getCapabilities());
        return true;
    }

}