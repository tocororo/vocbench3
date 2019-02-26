import { Injectable } from "@angular/core";
import { RDFResourceRolesEnum } from "../models/ARTResources";
import { ClassesServices } from "../services/classesServices";
import { DatatypesServices } from "../services/datatypesServices";
import { OntoLexLemonServices } from "../services/ontoLexLemonServices";
import { PropertyServices } from "../services/propertyServices";
import { ResourcesServices } from "../services/resourcesServices";
import { SkosServices } from "../services/skosServices";
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
            conditions: { pre: {}, post: {} },
            title: "Create class",
            resAction: ResAction.create,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.classesCreateSubClass,
            roles: [RDFResourceRolesEnum.cls],
            conditions: { pre: { selectionRequired: true, allowedWithChild: true }, post: {} },
            title: "Create subClass",
            resAction: ResAction.addChild,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.classesDeleteClass,
            roles: [RDFResourceRolesEnum.cls],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete class",
            resAction: ResAction.delete,
            editType: "D"
        },
        //concept
        {
            actionId: VBActionsEnum.skosCreateTopConcept,
            roles: [RDFResourceRolesEnum.concept],
            conditions: { pre: {}, post: {} },
            title: "Create concept",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.skosCreateNarrowerConcept,
            roles: [RDFResourceRolesEnum.concept],
            conditions: { pre: { selectionRequired: true, allowedWithChild: true }, post: {} },
            title: "Create narrower concept",
            resAction: ResAction.addChild,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.skosDeleteConcept,
            roles: [RDFResourceRolesEnum.concept],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete concept",
            resAction: ResAction.delete,
            editType: "D"
        },
        //conceptScheme
        {
            actionId: VBActionsEnum.skosCreateScheme,
            roles: [RDFResourceRolesEnum.conceptScheme],
            conditions: { pre: {}, post: {} },
            title: "Create scheme",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.skosDeleteScheme,
            roles: [RDFResourceRolesEnum.conceptScheme],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete scheme",
            resAction: ResAction.delete,
            editType: "D"
        },
        //dataRange
        {
            actionId: VBActionsEnum.datatypesCreateDatatype,
            roles: [RDFResourceRolesEnum.dataRange],
            conditions: { pre: {}, post: {} },
            title: "Create datatype",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.datatypesDeleteDatatype,
            roles: [RDFResourceRolesEnum.dataRange],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete datatype",
            resAction: ResAction.delete,
            editType: "D"
        },
        //inidividual
        {
            actionId: VBActionsEnum.classesCreateIndividual,
            roles: [RDFResourceRolesEnum.individual],
            conditions: { pre: {}, post: {} },
            title: "Create instance",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.classesDeleteIndividual,
            roles: [RDFResourceRolesEnum.individual],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete instance",
            resAction: ResAction.delete,
            editType: "D"
        },
        //limeLexicon
        {
            actionId: VBActionsEnum.ontolexCreateLexicon,
            roles: [RDFResourceRolesEnum.limeLexicon],
            conditions: { pre: {}, post: {} },
            title: "Create lexicon",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.ontolexDeleteLexicon,
            roles: [RDFResourceRolesEnum.limeLexicon],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete lexicon",
            resAction: ResAction.delete,
            editType: "D"
        },
        //ontolexLexicalEntry
        {
            actionId: VBActionsEnum.ontolexCreateLexicalEntry,
            roles: [RDFResourceRolesEnum.ontolexLexicalEntry],
            conditions: { pre: {}, post: {} },
            title: "Create lexical entry",
            resAction: ResAction.create,
            editType: "C",
        },
        {
            actionId: VBActionsEnum.ontolexDeleteLexicalEntry,
            roles: [RDFResourceRolesEnum.ontolexLexicalEntry],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete lexical entry",
            resAction: ResAction.delete,
            editType: "D"
        },
        //property
        {
            actionId: VBActionsEnum.propertiesCreateProperty,
            roles: [RDFResourceRolesEnum.property],
            subRoles: [RDFResourceRolesEnum.annotationProperty, RDFResourceRolesEnum.datatypeProperty, RDFResourceRolesEnum.objectProperty, RDFResourceRolesEnum.ontologyProperty],
            conditions: { pre: {}, post: {} },
            title: "Create property",
            resAction: ResAction.create,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.propertiesCreateSubProperty,
            roles: [RDFResourceRolesEnum.property],
            conditions: { pre: { selectionRequired: true, allowedWithChild: true }, post: {} },
            title: "Create subProperty",
            resAction: ResAction.addChild,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.propertiesDeleteProperty,
            roles: [RDFResourceRolesEnum.property],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete property",
            resAction: ResAction.delete,
            editType: "D"
        },
        //skosCollection
        {
            actionId: VBActionsEnum.skosCreateCollection,
            roles: [RDFResourceRolesEnum.skosCollection],
            subRoles: [RDFResourceRolesEnum.skosOrderedCollection],
            conditions: { pre: {}, post: {} },
            title: "Create collection",
            resAction: ResAction.create,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.skosCreateSubCollection,
            roles: [RDFResourceRolesEnum.skosCollection],
            subRoles: [RDFResourceRolesEnum.skosOrderedCollection],
            conditions: { pre: { selectionRequired: true, allowedWithChild: true }, post: {} },
            title: "Create nested collection",
            resAction: ResAction.addChild,
            editType: "C"
        },
        {
            actionId: VBActionsEnum.skosDeleteCollection,
            roles: [RDFResourceRolesEnum.skosCollection],
            conditions: { pre: { selectionRequired: true }, post: { deselectOnComplete: true } },
            title: "Delete collection",
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
            conditions: { pre: { selectionRequired: true }, post: {} },
            title: "Deprecate",
            resAction: ResAction.deprecate,
            editType: "D"
        },
    ];

    constructor(skosService: SkosServices, classesService: ClassesServices, propertyService: PropertyServices,
        ontolexService: OntoLexLemonServices, datatypeService: DatatypesServices, resourceService: ResourcesServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices) {
        this.vbFunctions = new VBActionFunctions(skosService, classesService, propertyService, ontolexService, datatypeService, resourceService, basicModals, creationModals);
    }

    getActionsForRole(role: RDFResourceRolesEnum): ActionDescription[] {
        let actions: ActionDescription[] = [];
        this.structs.forEach(s => {
            if (s.roles.indexOf(role) != -1) {
                actions.push({
                    id: s.actionId,
                    role: role,
                    subRoles: s.subRoles,
                    conditions: s.conditions,
                    editType: s.editType,
                    title: s.title,
                    icon: UIUtils.getActionImageSrc(role, s.resAction),
                    function: this.vbFunctions.getFunction(s.actionId),
                    capability: AuthorizationEvaluator.actionAuthGoalMap[s.actionId],
                });
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
    title: string; //text associated to the action in the UI
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
        selectionRequired?: boolean; //if the action require a resource to be selected
        allowedWithChild?: boolean; //if action can be performed when the selected resource (if any) has child resource
    };
    post: {
        deselectOnComplete?: boolean; //tells if the selected resource (if required is true) should be deselected once the action is done
    }
}