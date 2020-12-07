import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { RDFResourceRolesEnum } from "../models/ARTResources";
import { ClassesServices } from "../services/classesServices";
import { DatatypesServices } from "../services/datatypesServices";
import { OntoLexLemonServices } from '../services/ontoLexLemonServices';
import { PropertyServices } from '../services/propertyServices';
import { ResourcesServices } from '../services/resourcesServices';
import { SkosServices } from '../services/skosServices';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";
import { AuthorizationEvaluator } from "./AuthorizationEvaluator";
import { UIUtils } from "./UIUtils";
import { VBActionFunction, VBActionFunctions, VBActionsEnum } from "./VBActions";

export enum ResAction {
    create = "create",
    addChild = "addChild",
    delete = "delete",
    deprecate = "deprecate"
}

@Injectable()
export class RoleActionResolver {

    private vbFunctions: VBActionFunctions;

    private structs: ActionStruct[] = [
        //cls
        {
            actionId: VBActionsEnum.classesCreateClass,
            roles: [RDFResourceRolesEnum.cls],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.CLASS.CREATE",
            resAction: ResAction.create,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.classesCreateSubClass,
            roles: [RDFResourceRolesEnum.cls],
            conditions: { pre: { selectionRequired: true, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.CLASS.CREATE_CHILD",
            resAction: ResAction.addChild,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.classesDeleteClass,
            roles: [RDFResourceRolesEnum.cls],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.CLASS.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //concept
        {
            actionId: VBActionsEnum.skosCreateTopConcept,
            roles: [RDFResourceRolesEnum.concept],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.CONCEPT.CREATE",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.skosCreateNarrowerConcept,
            roles: [RDFResourceRolesEnum.concept],
            conditions: { pre: { selectionRequired: true, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.CONCEPT.CREATE_CHILD",
            resAction: ResAction.addChild,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.skosDeleteConcept,
            roles: [RDFResourceRolesEnum.concept],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.CONCEPT.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //conceptScheme
        {
            actionId: VBActionsEnum.skosCreateScheme,
            roles: [RDFResourceRolesEnum.conceptScheme],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.SCHEME.CREATE",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.skosDeleteScheme,
            roles: [RDFResourceRolesEnum.conceptScheme],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.SCHEME.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //dataRange
        {
            actionId: VBActionsEnum.datatypesCreateDatatype,
            roles: [RDFResourceRolesEnum.dataRange],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.DATATYPE.CREATE",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.datatypesDeleteDatatype,
            roles: [RDFResourceRolesEnum.dataRange],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.DATATYPE.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //inidividual
        {
            actionId: VBActionsEnum.classesCreateIndividual,
            roles: [RDFResourceRolesEnum.individual],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.INSTANCE.CREATE",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.classesDeleteIndividual,
            roles: [RDFResourceRolesEnum.individual],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.INSTANCE.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //limeLexicon
        {
            actionId: VBActionsEnum.ontolexCreateLexicon,
            roles: [RDFResourceRolesEnum.limeLexicon],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.LEXICON.CREATE",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.ontolexDeleteLexicon,
            roles: [RDFResourceRolesEnum.limeLexicon],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.LEXICON.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //ontolexLexicalEntry
        {
            actionId: VBActionsEnum.ontolexCreateLexicalEntry,
            roles: [RDFResourceRolesEnum.ontolexLexicalEntry],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.LEX_ENTRY.CREATE",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.ontolexDeleteLexicalEntry,
            roles: [RDFResourceRolesEnum.ontolexLexicalEntry],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.LEX_ENTRY.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //property
        {
            actionId: VBActionsEnum.propertiesCreateProperty,
            roles: [RDFResourceRolesEnum.property],
            subRoles: [RDFResourceRolesEnum.annotationProperty, RDFResourceRolesEnum.datatypeProperty, RDFResourceRolesEnum.objectProperty, RDFResourceRolesEnum.ontologyProperty],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.PROPERTIES.CREATE",
            resAction: ResAction.create,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.propertiesCreateSubProperty,
            roles: [RDFResourceRolesEnum.property],
            conditions: { pre: { selectionRequired: true, childlessRequired: false, explicitRequired: false }, post: {} },
            actionTranslationKey: "DATA.PROPERTIES.CREATE_CHILD",
            resAction: ResAction.addChild,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.propertiesDeleteProperty,
            roles: [RDFResourceRolesEnum.property],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.PROPERTIES.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //skosCollection
        {
            actionId: VBActionsEnum.skosCreateCollection,
            roles: [RDFResourceRolesEnum.skosCollection],
            subRoles: [RDFResourceRolesEnum.skosOrderedCollection],
            conditions: { pre: { selectionRequired: false, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.COLLECTION.CREATE",
            resAction: ResAction.create,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.skosCreateSubCollection,
            roles: [RDFResourceRolesEnum.skosCollection],
            subRoles: [RDFResourceRolesEnum.skosOrderedCollection],
            conditions: { pre: { selectionRequired: true, childlessRequired: false, explicitRequired: false }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.COLLECTION.CREATE_CHILD",
            resAction: ResAction.addChild,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.skosDeleteCollection,
            roles: [RDFResourceRolesEnum.skosCollection],
            conditions: { pre: { selectionRequired: true, childlessRequired: true, explicitRequired: true }, post: { deselectOnComplete: true } },
            actionTranslationKey: "DATA.COLLECTION.DELETE",
            resAction: ResAction.delete,
            editType: "D"
        },
        //common
        {
            actionId: VBActionsEnum.resourcesSetDeprecated,
            roles: [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, 
                RDFResourceRolesEnum.dataRange, RDFResourceRolesEnum.individual, RDFResourceRolesEnum.limeLexicon, 
                RDFResourceRolesEnum.limeLexicon, RDFResourceRolesEnum.ontolexLexicalEntry, RDFResourceRolesEnum.property,
                RDFResourceRolesEnum.skosCollection],
            conditions: { pre: { selectionRequired: true, childlessRequired: false, explicitRequired: true }, post: { deselectOnComplete: false } },
            actionTranslationKey: "DATA.COMMONS.DEPRECATE",
            resAction: ResAction.deprecate,
            editType: "D"
        },
    ];

    constructor(skosService: SkosServices, classesService: ClassesServices, propertyService: PropertyServices,
        ontolexService: OntoLexLemonServices, datatypeService: DatatypesServices, resourceService: ResourcesServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, private translateService: TranslateService) {
        this.vbFunctions = new VBActionFunctions(skosService, classesService, propertyService, ontolexService, datatypeService, resourceService, basicModals, creationModals);
    }

    getActionsForRole(role: RDFResourceRolesEnum): ActionDescription[] {
        let actions: ActionDescription[] = [];
        this.structs.forEach(s => {
            if (s.roles.indexOf(role) != -1) {
                let a: ActionDescription = {
                    id: s.actionId,
                    role: role,
                    subRoles: s.subRoles,
                    conditions: s.conditions,
                    editType: s.editType,
                    title: null,
                    icon: UIUtils.getActionImageSrc(role, s.resAction),
                    function: this.vbFunctions.getFunction(s.actionId),
                    capability: AuthorizationEvaluator.actionAuthGoalMap[s.actionId],
                }
                this.translateService.get(s.actionTranslationKey).subscribe(translation => a.title = translation);
                actions.push(a);
            }
        })

        return actions;
    }

}

class ActionStruct {
    actionId: VBActionsEnum;
    roles: RDFResourceRolesEnum[];
    subRoles?: RDFResourceRolesEnum[]; //adding a subRoles to an action causes the button of the action to become a dropdown-button that allow the operation on the main role and on the subRoles
    conditions: ActionConditions;
    editType: "C" | "D"; //create or delete. Useful to make visible/invisible the action (e.g. delete must not be visible if a panel in open when enriching a property, only creation is allowed)
    // title: string; //text associated to the action in the UI
    actionTranslationKey: string; //tooltip associated to the action in the UI
    resAction: ResAction; //action on the resource
}

/**
 * "Extension" of the ActionStruct. ActionStruct define a generic action for a set of roles. This class extends it with the addition of:
 * - function: the function that will be invoked by the action
 * - capability: the capability required in order to perform the action
 * - icon: the image shown on the button that trigger the action.
 *   It depends from the specific role which the action is asked for at runtime (not known in ActionStruct)
 */
export class ActionDescription {
    //copied from ActionStruct
    id: VBActionsEnum;
    subRoles?: RDFResourceRolesEnum[];
    conditions: ActionConditions;
    editType: "C" | "D";
    title: string;
    //extension
    role: RDFResourceRolesEnum; //different from ActionStruct since this represent only the role that has been requested
    icon: string;
    function: VBActionFunction;
    capability: string;
}

export class ActionConditions {
    pre: {
        selectionRequired?: boolean; //if true, the action requires a resource to be selected
        childlessRequired?: boolean; //if true, the action requires that the selected resource (if any) must have no child resources
        explicitRequired?: boolean; //if true, the action requires that the selected resource (if any) must be explicit (defined in the main graph, not in staging)
    };
    post: {
        deselectOnComplete?: boolean; //tells if the selected resource (if required is true) should be deselected once the action is done
    }
}