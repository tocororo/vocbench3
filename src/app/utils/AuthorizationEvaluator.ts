import Prolog from 'jsprolog';
import { ARTResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { ResViewPartition } from "../models/ResourceView";
import { User } from "../models/User";
import { VBContext } from "./VBContext";
import { VBActionsEnum } from './VBActions';

export class AuthorizationEvaluator {

    private static prologEngine: any;
    private static resRole: string = "%resource_role%";
    private static authCache: { [goal: string]: boolean } = {}

    public static actionAuthGoalMap: { [key: string]: string } = {
        [VBActionsEnum.administrationProjectManagement] : 'auth(pm(project,_), "CRUD").',
        [VBActionsEnum.administrationRoleManagement] : 'auth(rbac(_,_), "CRUD").',
        [VBActionsEnum.administrationUserGroupManagement] : 'auth(pm(project, group), "CU").', //generic for management of UsersGroup in project
        [VBActionsEnum.administrationUserRoleManagement] : 'auth(rbac(user,_), "CRUD").',
        [VBActionsEnum.alignmentAddAlignment] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', alignment), "C").',
        [VBActionsEnum.alignmentLoadAlignment] : 'auth(rdf(resource, alignment), "R").',
        [VBActionsEnum.classesCreateClass] :  'auth(rdf(cls), "C").',
        [VBActionsEnum.classesCreateSubClass] :  'auth(rdf(cls), "C").',
        [VBActionsEnum.classesCreateClassAxiom] :  'auth(rdf(cls, taxonomy), "C").', //@PreAuthorize of addOneOf/UnionOf/IntersectionOf...
        [VBActionsEnum.classesCreateIndividual] :  'auth(rdf(individual), "C").',
        [VBActionsEnum.classesDeleteClass] :  'auth(rdf(cls), "D").',
        [VBActionsEnum.classesDeleteIndividual] :  'auth(rdf(individual), "D").',
        [VBActionsEnum.classesGetClassTaxonomy] :  'auth(rdf(cls, taxonomy), "R").',
        [VBActionsEnum.classesGetInstances] :  'auth(rdf(cls, instances), "R").',
        [VBActionsEnum.classesRemoveClassAxiom] :  'auth(rdf(cls, taxonomy), "D").', //@PreAuthorize of removeOneOf/UnionOf/IntersectionOf...
        [VBActionsEnum.collaboration] :  'auth(pm(project, collaboration), "CRUD").',  //generic for Collaboration (creation and assignment of CS project)
        [VBActionsEnum.customFormCreateFormMapping] :  'auth(cform(form, mapping), "C").', 
        [VBActionsEnum.customFormCreateCollection] :  'auth(cform(formCollection), "C").', 
        [VBActionsEnum.customFormCreateForm] :  'auth(cform(formCollection), "C").', 
        [VBActionsEnum.customFormDeleteFormMapping] :  'auth(cform(form, mapping), "D").', 
        [VBActionsEnum.customFormDeleteCollection] :  'auth(cform(formCollection), "D").', 
        [VBActionsEnum.customFormDeleteForm] :  'auth(cform(form), "D").', 
        [VBActionsEnum.customFormGetFormMappings] :  'auth(cform(formCollection), "R").', 
        [VBActionsEnum.customFormGetCollections] :  'auth(cform(formCollection), "R").', 
        [VBActionsEnum.customFormGetForms] :  'auth(cform(form), "R").',
        [VBActionsEnum.customFormUpdateFormMapping] :  'auth(cform(form, mapping), "U").', 
        [VBActionsEnum.customFormUpdateCollection] :  'auth(cform(formCollection), "U").', 
        [VBActionsEnum.customFormUpdateForm] :  'auth(cform(form), "U").',
        [VBActionsEnum.datatypesCreateDatatype] : 'auth(rdf(datatype), "C").',
        [VBActionsEnum.datatypesDeleteDatatype] : 'auth(rdf(datatype), "D").',
        [VBActionsEnum.datatypesGetDatatype] : 'auth(rdf(datatype), "R").',
        [VBActionsEnum.datasetMetadataExport] : 'auth(rdf(dataset, metadata), "CU").', //export require to set the metadata, so requires CU
        [VBActionsEnum.datasetMetadataGetMetadata] : 'auth(rdf(dataset, metadata), "R").',
        [VBActionsEnum.exportExport] : 'auth(rdf, "R").',
        [VBActionsEnum.history] :  'auth(rdf, "R").',
        [VBActionsEnum.icvDanglingXLabel] : 'auth(rdf(xLabel), "R").',
        [VBActionsEnum.icvGenericConcept] : 'auth(rdf(concept), "R").',
        [VBActionsEnum.icvGenericResource] : 'auth(rdf(resource), "R").',
        [VBActionsEnum.individualsAddType] : 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "U").',
        [VBActionsEnum.individualsGetInstances] : 'auth(rdf(cls, instances), "R").',
        [VBActionsEnum.individualsRemoveType] : 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "D").',
        [VBActionsEnum.inputOutputClearData] : 'auth(rdf, "D").',
        [VBActionsEnum.inputOutputLoadData] : 'auth(rdf, "C").',
        [VBActionsEnum.metadataAddImport] : 'auth(rdf(import), "C").',
        [VBActionsEnum.metadataChangeNsPrefixMapping] : 'auth(pm(project, prefixMapping), "U").',
        [VBActionsEnum.metadataRemoveImport] : 'auth(rdf(import), "D").',
        [VBActionsEnum.metadataRemoveNsPrefixMapping] : 'auth(pm(project, prefixMapping), "D").',
        [VBActionsEnum.metadataSetDefaultNs] : 'auth(pm(project, defnamespace), "U").',
        [VBActionsEnum.metadataSetNsPrefixMapping] : 'auth(pm(project, prefixMapping), "U").',
        [VBActionsEnum.metadataRegistryCreate] : 'auth(sys(metadataRegistry), "C").',
        [VBActionsEnum.metadataRegistryDelete] : 'auth(sys(metadataRegistry), "D").',
        [VBActionsEnum.metadataRegistryRead] : 'auth(sys(metadataRegistry), "R").',
        [VBActionsEnum.metadataRegistryUpdate] : 'auth(sys(metadataRegistry), "U").',
        [VBActionsEnum.ontManagerDeleteOntologyMirror] : 'auth(sys(ontologyMirror), "D").',
        [VBActionsEnum.ontManagerUpdateOntologyMirror] : 'auth(sys(ontologyMirror), "CU").',
        [VBActionsEnum.ontolexAddFormRepresentation] : 'auth(rdf(ontolexForm, formRepresentations), "C").',
        [VBActionsEnum.ontolexAddLexicalForm] : 'auth(rdf(ontolexLexicalEntry), "U").',
        [VBActionsEnum.ontolexAddLexicalization] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "C").',
        [VBActionsEnum.ontolexAddSubterm] : 'auth(rdf(ontolexLexicalEntry, subterms), "C").',
        [VBActionsEnum.ontolexClearLexicalEntryConstituent] : 'auth(rdf(ontolexLexicalEntry, constituents), "D").',
        [VBActionsEnum.ontolexCreateLexicalEntry] : 'auth(rdf(ontolexLexicalEntry), "C").',
        [VBActionsEnum.ontolexCreateLexicon] : 'auth(rdf(limeLexicon), "C").',
        [VBActionsEnum.ontolexDeleteLexicalEntry] : 'auth(rdf(ontolexLexicalEntry), "D").',
        [VBActionsEnum.ontolexDeleteLexicon] : 'auth(rdf(limeLexicon), "D").',
        [VBActionsEnum.ontolexGetLexicalEntry] : 'auth(rdf(ontolexLexicalEntry), "R").',
        [VBActionsEnum.ontolexGetLexicon] : 'auth(rdf(limeLexicon), "R").',
        [VBActionsEnum.ontolexRemoveFormRepresentation] : 'auth(rdf(ontolexForm, formRepresentations), "U").',
        [VBActionsEnum.ontolexRemoveLexicalForm] : 'auth(rdf(ontolexLexicalEntry), "U").',
        [VBActionsEnum.ontolexRemovePlainLexicalization] : 'auth(rdf(resource, lexicalization), "D").',
        [VBActionsEnum.ontolexRemoveReifiedLexicalization] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "D").',
        [VBActionsEnum.ontolexRemoveSubterm] : 'auth(rdf(ontolexLexicalEntry, subterms), "D").',
        [VBActionsEnum.ontolexSetLexicalEntryConstituent] : 'auth(rdf(ontolexLexicalEntry, constituents), "C").',
        [VBActionsEnum.pluginsGetPlugins] : 'auth(sys(plugins), "R").',
        [VBActionsEnum.propertiesAddPropertyChainAxiom] : 'auth(rdf(property, taxonomy), "C").',
        [VBActionsEnum.propertiesAddPropertyDomain] : 'auth(rdf(property), "C").',
        [VBActionsEnum.propertiesAddPropertyRange] : 'auth(rdf(property), "C").',
        [VBActionsEnum.propertiesAddSuperProperty] : 'auth(rdf(property, taxonomy), "C").',
        [VBActionsEnum.propertiesAddDisjointProperty] : 'auth(rdf(property, taxonomy), "C").',
        [VBActionsEnum.propertiesAddEquivalentProperty] : 'auth(rdf(property, taxonomy), "C").',
        [VBActionsEnum.propertiesCreateProperty] : 'auth(rdf(property), "C").', 
        [VBActionsEnum.propertiesCreateSubProperty] : 'auth(rdf(property), "C").', 
        [VBActionsEnum.propertiesDeleteProperty] : 'auth(rdf(property), "D").',
        [VBActionsEnum.propertiesGetPropertyTaxonomy] : 'auth(rdf(property, taxonomy), "R").',
        [VBActionsEnum.propertiesRemovePropertyChainAxiom] : 'auth(rdf(property, taxonomy), "D").',
        [VBActionsEnum.propertiesRemovePropertyDomain] : 'auth(rdf(property), "D").',
        [VBActionsEnum.propertiesRemovePropertyRange] : 'auth(rdf(property), "D").',
        [VBActionsEnum.propertiesRemoveSuperProperty] : 'auth(rdf(property, taxonomy), "D").',
        [VBActionsEnum.propertiesRemoveDisjointProperty] : 'auth(rdf(property, taxonomy), "D").',
        [VBActionsEnum.propertiesRemoveEquivalentProperty] : 'auth(rdf(property, taxonomy), "D").',
        [VBActionsEnum.refactorChangeResourceUri] : 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "U").',
        [VBActionsEnum.refactorMigrateToBaseUriGraph] : 'auth(rdf, "CRUD").',
        [VBActionsEnum.refactorMoveXLabelToResource] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "CD").',
        [VBActionsEnum.refactorReplaceBaseUri] : 'auth(rdf, "CRUD").',
        [VBActionsEnum.refactorSkosToSkosxl] : 'auth(lexicalization, "CD").',
        [VBActionsEnum.refactorSkosxlToSkos] : 'auth(lexicalization, "CD").',
        [VBActionsEnum.refactorSpawnNewConceptFromLabel] : 'auth(rdf(concept), "C").', 
        [VBActionsEnum.resourcesAddValue] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', values), "C").', 
        [VBActionsEnum.resourcesRemoveValue] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', values), "D").', 
        [VBActionsEnum.resourcesRemovePredicateObject] : 'auth(rdf(resource, values), "D").', 
        [VBActionsEnum.resourcesSetDeprecated] : 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "U").',
        [VBActionsEnum.resourcesUpdateTriple] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', values), "U").', 
        [VBActionsEnum.resourcesUpdatePredicateObject] : 'auth(rdf(resource, values), "U").', 
        [VBActionsEnum.sheet2Rdf] : 'auth(rdf, "CRUD").',
        [VBActionsEnum.skosAddBroaderConcept] : 'auth(rdf(concept, taxonomy), "C").', 
        [VBActionsEnum.skosAddConceptToScheme] : 'auth(rdf(concept, schemes), "C").', 
        [VBActionsEnum.skosAddLexicalization] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "C").',
        [VBActionsEnum.skosAddMultipleToScheme] : 'auth(rdf(concept, schemes), "C").',
        [VBActionsEnum.skosAddToCollection] : 'auth(rdf(skosCollection), "U").', //TODO is it ok? or add values (skosCollection, values)
        [VBActionsEnum.skosAddTopConcept] : 'auth(rdf(concept, schemes), "C").',
        [VBActionsEnum.skosCreateCollection] : 'auth(rdf(skosCollection), "C").', 
        [VBActionsEnum.skosCreateSubCollection] : 'auth(rdf(skosCollection), "C").', 
        [VBActionsEnum.skosCreateNarrowerConcept] : 'auth(rdf(concept), "C").', 
        [VBActionsEnum.skosCreateTopConcept] : 'auth(rdf(concept), "C").', 
        [VBActionsEnum.skosCreateScheme] : 'auth(rdf(conceptScheme), "C").', 
        [VBActionsEnum.skosDeleteCollection] : 'auth(rdf(skosCollection), "D").', 
        [VBActionsEnum.skosDeleteConcept] : 'auth(rdf(concept), "D").', 
        [VBActionsEnum.skosDeleteScheme] : 'auth(rdf(conceptScheme), "D").', 
        [VBActionsEnum.skosGetCollectionTaxonomy] : 'auth(rdf(skosCollection, taxonomy), "R").', 
        [VBActionsEnum.skosGetConceptTaxonomy] : 'auth(rdf(concept, taxonomy), "R").', 
        [VBActionsEnum.skosGetSchemes] : 'auth(rdf(conceptScheme), "R").', 
        [VBActionsEnum.skosRemoveBroaderConcept] : 'auth(rdf(concept, taxonomy), "D").',
        [VBActionsEnum.skosRemoveConceptFromScheme] : 'auth(rdf(concept, schemes), "D").',
        [VBActionsEnum.skosRemoveFromCollection] : 'auth(rdf(skosCollection), "U").', //TODO is it ok? or add values (skosCollection, values)
        [VBActionsEnum.skosRemoveLexicalization] : 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "D").',
        [VBActionsEnum.skosRemoveTopConcept] : 'auth(rdf(concept, schemes), "D").',
        [VBActionsEnum.sparqlEvaluateQuery] : 'auth(rdf(sparql), "R").',
        [VBActionsEnum.sparqlExecuteUpdate] : 'auth(rdf(sparql), "U").',
        [VBActionsEnum.validation] : 'auth(rdf, "V").',
        [VBActionsEnum.versionsCreateVersionDump] : 'auth(rdf(dataset, version), "C").',
        [VBActionsEnum.versionsGetVersions] : 'auth(rdf(dataset, version), "R").',
    };

    public static initEvalutator(capabilityList: string[]) {
        let db: string = this.tbox + this.jsPrologSupport;
        if (capabilityList.length > 0) {
            let capabilities = capabilityList.join(". ") + ".";
            db += capabilities;
        }
        // console.log(db);
        AuthorizationEvaluator.reset();
        AuthorizationEvaluator.prologEngine = Prolog.Parser.parse(db);
    }

    public static reset() {
        AuthorizationEvaluator.prologEngine = null;
        AuthorizationEvaluator.authCache = {}
    }

    
    /**
     * @param action 
     * @param resource If provided, is used to get its role 
     */
    public static isAuthorized(action: VBActionsEnum, resource?: ARTResource): boolean {
        var user: User = VBContext.getLoggedUser();
        if (user == null) {
            return false;    
        }
        if (user.isAdmin()) {
            return true;
        } else {
            if (AuthorizationEvaluator.prologEngine == null) { //engine not yet initialized
                return false;
            }
            //evaluate if the user capabilities satisfy the authorization requirement
            let goal: string = this.actionAuthGoalMap[action];
            if (goal.includes(AuthorizationEvaluator.resRole)) {//dynamic goal (depending on resource role)
                if (resource != null) {
                    goal = goal.replace(AuthorizationEvaluator.resRole, resource.getRole());
                } else {
                    throw new Error("Cannot resolve the authorization goal: goal depends on resource role, but resource is undefined");
                }
            }
            let cachedAuth: boolean = this.authCache[goal];
            if (cachedAuth != null) { //if it was chached => return it
                // console.log("authorization cached", cachedAuth);
                return cachedAuth;
            } else { //...otherwise compute authorization
                let authorized: boolean = this.evaulatePrologGoal(goal); //cache the result of the evaluation for the given goal
                this.authCache[goal] = authorized;
                return authorized;
            }
        }
    }

    private static evaulatePrologGoal(goal: string): boolean {
        let query = Prolog.Parser.parseQuery(goal);
        let iter = Prolog.Solver.query(AuthorizationEvaluator.prologEngine, query);
        let next: boolean = iter.next();
        // console.log("evaluating goal", goal);
        // console.log("next", next);
        return next;
    }

    //AUTHORIZATIONS FOR ADD/UPDATE/REMOVE IN RESOURCE VIEW PARTITION
    public static ResourceView = {
        isAddAuthorized(partition: ResViewPartition, resource?: ARTResource): boolean {
            return (
                (partition == ResViewPartition.broaders && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddBroaderConcept)) ||
                (partition == ResViewPartition.classaxioms && AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesCreateClassAxiom)) ||
                (partition == ResViewPartition.constituents && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexSetLexicalEntryConstituent)) ||
                (partition == ResViewPartition.denotations && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalization, resource)) ||
                (partition == ResViewPartition.disjointProperties && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddDisjointProperty)) ||
                (partition == ResViewPartition.domains && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyDomain)) ||
                (partition == ResViewPartition.equivalentProperties && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddEquivalentProperty)) ||
                (partition == ResViewPartition.evokedLexicalConcepts && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource)) ||
                (partition == ResViewPartition.facets && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource)) ||
                (partition == ResViewPartition.formRepresentations && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddFormRepresentation, resource)) ||
                (partition == ResViewPartition.imports && AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataAddImport)) ||
                (partition == ResViewPartition.labelRelations && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource)) ||
                (partition == ResViewPartition.lexicalizations && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddLexicalization, resource)) ||
                (partition == ResViewPartition.lexicalForms && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalForm)) ||
                (partition == ResViewPartition.lexicalSenses && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalization, resource)) ||
                (partition == ResViewPartition.members && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddToCollection)) ||
                (partition == ResViewPartition.membersOrdered && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddToCollection)) ||
                (partition == ResViewPartition.notes && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource)) ||
                (partition == ResViewPartition.properties && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource)) ||
                (partition == ResViewPartition.ranges && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyRange)) ||
                (partition == ResViewPartition.rdfsMembers && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue)) ||
                (partition == ResViewPartition.schemes && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddConceptToScheme)) ||
                (partition == ResViewPartition.subPropertyChains && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyChainAxiom)) ||
                (partition == ResViewPartition.subterms && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddSubterm)) ||
                (partition == ResViewPartition.superproperties && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddSuperProperty)) ||
                (partition == ResViewPartition.topconceptof && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddTopConcept)) ||
                (partition == ResViewPartition.types && AuthorizationEvaluator.isAuthorized(VBActionsEnum.individualsAddType, resource))
            );
        },
        isEditAuthorized(partition: ResViewPartition, resource?: ARTResource): boolean {
            return (
                //subPropertyChains is at the moment the only partition that in edit use its services instead of Resources.updateTriple()
                (partition == ResViewPartition.subPropertyChains && this.isRemoveAuthorized(partition, resource) && this.isAddAuthorized(partition, resource)) ||
                (partition != ResViewPartition.subPropertyChains && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource))
            );
        },
        isRemoveAuthorized(partition: ResViewPartition, resource?: ARTResource): boolean {
            return (
                (partition == ResViewPartition.broaders && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveBroaderConcept)) ||
                (partition == ResViewPartition.classaxioms && AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesRemoveClassAxiom)) ||
                (partition == ResViewPartition.constituents && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexClearLexicalEntryConstituent)) ||
                (partition == ResViewPartition.denotations && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemovePlainLexicalization)) ||
                (partition == ResViewPartition.disjointProperties && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveDisjointProperty)) ||
                (partition == ResViewPartition.domains && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyDomain)) ||
                (partition == ResViewPartition.equivalentProperties && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveEquivalentProperty)) ||
                (partition == ResViewPartition.evokedLexicalConcepts && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue)) ||
                (partition == ResViewPartition.facets && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource)) ||
                (partition == ResViewPartition.formRepresentations && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveFormRepresentation, resource)) ||
                (partition == ResViewPartition.imports && AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRemoveImport)) ||
                (partition == ResViewPartition.labelRelations && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource)) ||
                (partition == ResViewPartition.lexicalizations && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveLexicalization, resource)) ||
                (partition == ResViewPartition.lexicalForms && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveLexicalForm)) ||
                (partition == ResViewPartition.lexicalSenses && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveReifiedLexicalization)) ||
                (partition == ResViewPartition.members && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveFromCollection)) ||
                (partition == ResViewPartition.membersOrdered && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveFromCollection)) ||
                (partition == ResViewPartition.notes && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource)) ||
                (partition == ResViewPartition.properties && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource)) ||
                (partition == ResViewPartition.ranges && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyRange)) ||
                (partition == ResViewPartition.rdfsMembers && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue)) ||
                (partition == ResViewPartition.schemes && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveConceptFromScheme)) ||
                (partition == ResViewPartition.subPropertyChains && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyChainAxiom)) ||
                (partition == ResViewPartition.subterms && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveSubterm)) ||
                (partition == ResViewPartition.superproperties && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveSuperProperty)) ||
                (partition == ResViewPartition.topconceptof && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveTopConcept)) ||
                (partition == ResViewPartition.types && AuthorizationEvaluator.isAuthorized(VBActionsEnum.individualsRemoveType, resource))
            );
        }
    }

    //AUTHORIZATIONS FOR CRATE/DELETE IN TREES/LISTS
    // public static Tree = {
    //     isCreateAuthorized(role: RDFResourceRolesEnum) {
    //         return (
    //             (role == RDFResourceRolesEnum.cls && AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesCreateClass)) ||
    //             (role == RDFResourceRolesEnum.concept && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosCreateTopConcept)) ||
    //             (role == RDFResourceRolesEnum.conceptScheme && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosCreateScheme)) ||
    //             (role == RDFResourceRolesEnum.dataRange && AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesCreateDatatype)) ||
    //             (role == RDFResourceRolesEnum.individual && AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesCreateIndividual)) ||
    //             (role == RDFResourceRolesEnum.limeLexicon && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexCreateLexicon)) ||
    //             (role == RDFResourceRolesEnum.ontolexLexicalEntry && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexCreateLexicalEntry)) ||
    //             (role == RDFResourceRolesEnum.property && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesCreateProperty)) ||
    //             (role == RDFResourceRolesEnum.skosCollection && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosCreateCollection))
    //         );
    //     },
    //     isDeleteAuthorized(role: RDFResourceRolesEnum) {
    //         return (
    //             (role == RDFResourceRolesEnum.cls && AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesDeleteClass)) ||
    //             (role == RDFResourceRolesEnum.concept && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosDeleteConcept)) ||
    //             (role == RDFResourceRolesEnum.conceptScheme && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosDeleteScheme)) ||
    //             (role == RDFResourceRolesEnum.dataRange && AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesDeleteDatatype)) ||
    //             (role == RDFResourceRolesEnum.individual && AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesDeleteIndividual)) ||
    //             (role == RDFResourceRolesEnum.limeLexicon && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexDeleteLexicon)) ||
    //             (role == RDFResourceRolesEnum.ontolexLexicalEntry && AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexDeleteLexicalEntry)) ||
    //             (role == RDFResourceRolesEnum.property && AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesDeleteProperty)) ||
    //             (role == RDFResourceRolesEnum.skosCollection && AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosDeleteCollection))
    //         );
    //     },
    //     isDeprecateAuthorized(resource: ARTResource) {
    //         return AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesSetDeprecated, resource);
    //     }
    // }

    private static tbox = `
        auth(TOPIC, CRUDVRequest) :-
            chk_capability(TOPIC, CRUDV),
            resolveCRUDV(CRUDVRequest, CRUDV).
        
        chk_capability(TOPIC, CRUDV) :-
            capability(TOPIC, CRUDV).
        
        chk_capability(rdf(_), CRUDV) :-              
            chk_capability(rdf, CRUDV).  
        
        chk_capability(rdf(_,_), CRUDV) :-          
        chk_capability(rdf, CRUDV).
        
        chk_capability(rdf(Subject), CRUDV) :-
            capability(rdf(AvailableSubject), CRUDV),
            covered(Subject, AvailableSubject).  
        
        chk_capability(rdf(Subject,Scope), CRUDV) :-
            capability(rdf(AvailableSubject,Scope), CRUDV),
            covered(Subject, AvailableSubject).
        
        chk_capability(rdf(Subject,lexicalization(LANG)), CRUDV) :-
            capability(rdf(AvailableSubject,lexicalization(LANGCOVERAGE)), CRUDV),
            covered(Subject, AvailableSubject),
            resolveLANG(LANG, LANGCOVERAGE).

        chk_capability(rdf(SKOSELEMENT), CRUDV) :-
            capability(rdf(skos), CRUDV),
            vocabulary(SKOSELEMENT, skos).
	
        chk_capability(rdf(SKOSELEMENT,_), CRUDV) :-
            capability(rdf(skos), CRUDV),
            vocabulary(SKOSELEMENT, skos).
        
        chk_capability(rdf(_,lexicalization(LANG)), CRUDV) :-
            capability(rdf(lexicalization(LANGCOVERAGE)), CRUDV),
            resolveLANG(LANG, LANGCOVERAGE).
        
        chk_capability(rdf(xLabel(LANG)), CRUDV) :-
            capability(rdf(lexicalization(LANGCOVERAGE)), CRUDV),
            resolveLANG(LANG, LANGCOVERAGE).
        
        chk_capability(rdf(xLabel(LANG),_), CRUDV) :-
            capability(rdf(lexicalization(LANGCOVERAGE)), CRUDV),
            resolveLANG(LANG, LANGCOVERAGE).
        
        chk_capability(rdf(_,lexicalization(_)), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(xLabel(_)), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(xLabel(_),_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(_,lexicalization), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).

        chk_capability(rdf(_,notes), CRUDV) :-
            capability(rdf(notes), CRUDV).
        
        chk_capability(rdf(xLabel), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(xLabel,_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).

        chk_capability(rbac(_), CRUDV) :-	
            chk_capability(rbac, CRUDV).	

        chk_capability(rbac(_,_), CRUDV) :-	
            chk_capability(rbac, CRUDV).

        resolveCRUDV(CRUDVRequest, CRUDV) :-
            char_subset(CRUDVRequest, CRUDV).

        resolveLANG(LANG, LANGCOVERAGE) :-
            split_string(LANG,",","",LANGList),
            split_string(LANGCOVERAGE,",","",LANGCOVERAGEList),
                subset(LANGList, LANGCOVERAGEList).
        
        
        covered(Subj,resource) :- role(Subj).
        covered(objectProperty, property).
        covered(datatypeProperty, property).
        covered(annotationProperty, property).
        covered(ontologyProperty, property).
        covered(skosOrderedCollection, skosCollection).
        covered(Role, Role).
        
        role(cls).
        role(individual).
        role(property).
        role(objectProperty).
        role(datatypeProperty).
        role(annotationProperty).
        role(ontologyProperty).
        role(ontology).
        role(dataRange).
        role(concept).
        role(conceptScheme).
        role(xLabel).
        role(xLabel(_)).
        role(skosCollection).
        role(skosOrderedCollection).

        vocabulary(concept, skos).
        vocabulary(conceptScheme, skos).
        vocabulary(skosCollection, skos).
        
        getCapabilities(FACTLIST) :- findall(capability(A,CRUD),capability(A,CRUD),FACTLIST).    
        `;

    private static jsPrologSupport = `
        char_subset(A,B) :-
            subset(A,B).

        subset([],_).
 
        subset([H|R],L) :-
            member(H,L),
            subset(R,L).
        
        member(E,[E|_]).
        member(E,[_|T]) :-
        member(E,T).
        `;

}