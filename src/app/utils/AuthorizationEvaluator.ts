import Prolog from 'jsprolog';
import { ARTResource, ARTNode, ResAttribute } from "../models/ARTResources";
import { ResViewPartition } from "../models/ResourceView";
import { User } from "../models/User";
import { VBActionsEnum } from './VBActions';
import { VBContext } from "./VBContext";

export class AuthorizationEvaluator {

    private static prologEngine: any;
    private static resRole: string = "%resource_role%";
    private static authCache: { [goal: string]: boolean } = {}

    public static actionAuthGoalMap: { [key: string]: string } = {
        [VBActionsEnum.administrationProjectManagement]: 'auth(pm(project,_), "CRUD").',
        [VBActionsEnum.administrationRoleManagement]: 'auth(rbac(_,_), "CRUD").',
        [VBActionsEnum.administrationUserGroupManagement]: 'auth(pm(project, group), "CU").', //generic for management of UsersGroup in project
        [VBActionsEnum.administrationUserRoleManagement]: 'auth(rbac(user,_), "CRUD").',
        [VBActionsEnum.alignmentAddAlignment]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', alignment), "C").',
        [VBActionsEnum.alignmentApplyAlignment]: 'auth(rdf(resource, alignment), "CUD").',
        [VBActionsEnum.alignmentLoadAlignment]: 'auth(rdf(resource, alignment), "R").',
        [VBActionsEnum.classesCreateClass]: 'auth(rdf(cls), "C").',
        [VBActionsEnum.classesCreateSubClass]: 'auth(rdf(cls), "C").',
        [VBActionsEnum.classesCreateClassAxiom]: 'auth(rdf(cls, taxonomy), "C").', //@PreAuthorize of addOneOf/UnionOf/IntersectionOf...
        [VBActionsEnum.classesCreateIndividual]: 'auth(rdf(individual), "C").',
        [VBActionsEnum.classesDeleteClass]: 'auth(rdf(cls), "D").',
        [VBActionsEnum.classesDeleteIndividual]: 'auth(rdf(individual), "D").',
        [VBActionsEnum.classesRead]: 'auth(rdf(cls), "R").',
        [VBActionsEnum.classesGetClassTaxonomy]: 'auth(rdf(cls, taxonomy), "R").',
        [VBActionsEnum.classesGetInstances]: 'auth(rdf(cls, instances), "R").',
        [VBActionsEnum.classesRemoveClassAxiom]: 'auth(rdf(cls, taxonomy), "D").', //@PreAuthorize of removeOneOf/UnionOf/IntersectionOf...
        [VBActionsEnum.collaboration]: 'auth(pm(project, collaboration), "CRUD").',  //generic for Collaboration (creation and assignment of CS project)
        [VBActionsEnum.customFormCreateFormMapping]: 'auth(cform(form, mapping), "C").',
        [VBActionsEnum.customFormCreateCollection]: 'auth(cform(formCollection, form), "C").',
        [VBActionsEnum.customFormCreateForm]: 'auth(cform(formCollection, form), "C").',
        [VBActionsEnum.customFormDeleteFormMapping]: 'auth(cform(form, mapping), "D").',
        [VBActionsEnum.customFormDeleteCollection]: 'auth(cform(formCollection, form), "D").',
        [VBActionsEnum.customFormDeleteForm]: 'auth(cform(form), "D").',
        [VBActionsEnum.customFormGetFormMappings]: 'auth(cform(form, mapping), "R").',
        [VBActionsEnum.customFormGetCollections]: 'auth(cform(formCollection, form), "R").',
        [VBActionsEnum.customFormGetForms]: 'auth(cform(form), "R").',
        [VBActionsEnum.customFormUpdateFormMapping]: 'auth(cform(form, mapping), "U").',
        [VBActionsEnum.customFormUpdateCollection]: 'auth(cform(formCollection, form), "U").',
        [VBActionsEnum.customFormUpdateForm]: 'auth(cform(form), "U").',
        [VBActionsEnum.customServiceCreate]: 'auth(customService(service), "C").',
        [VBActionsEnum.customServiceRead]: 'auth(customService(service), "R").',
        [VBActionsEnum.customServiceUpdate]: 'auth(customService(service), "U").',
        [VBActionsEnum.customServiceDelete]: 'auth(customService(service), "D").',
        [VBActionsEnum.customServiceOperationCreate]: 'auth(customService(service, operation), "C").',
        [VBActionsEnum.customServiceOperationUpdate]: 'auth(customService(service, operation), "U").',
        [VBActionsEnum.customServiceOperationDelete]: 'auth(customService(service, operation), "D").',
        [VBActionsEnum.datatypesCreateDatatype]: 'auth(rdf(datatype), "C").',
        [VBActionsEnum.datatypesDeleteDatatype]: 'auth(rdf(datatype), "D").',
        [VBActionsEnum.datatypesGetDatatype]: 'auth(rdf(datatype), "R").',
        [VBActionsEnum.datatypesDeleteDatatypeRestriction]: 'auth(rdf(datatype), "D").',
        [VBActionsEnum.datatypesRead]: 'auth(rdf(datatype), "R").',
        [VBActionsEnum.datatypesSetDatatypeRestriction]: 'auth(rdf(datatype), "C").',
        [VBActionsEnum.datasetMetadataExport]: 'auth(rdf(dataset, metadata), "CU").', //export require to set the metadata, so requires CU
        [VBActionsEnum.datasetMetadataGetMetadata]: 'auth(rdf(dataset, metadata), "R").',
        [VBActionsEnum.exportDataDump]: 'auth(rdf(code), "R").',
        [VBActionsEnum.exportExport]: 'auth(rdf(code), "R").',
        [VBActionsEnum.graphRead]: 'auth(rdf(code), "R").',
        [VBActionsEnum.history]: 'auth(rdf(code), "R").',
        [VBActionsEnum.icvDanglingXLabel]: 'auth(rdf(xLabel), "R").',
        [VBActionsEnum.icvGenericConcept]: 'auth(rdf(concept), "R").',
        [VBActionsEnum.icvGenericResource]: 'auth(rdf(resource), "R").',
        [VBActionsEnum.individualsAddType]: 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "U").',
        [VBActionsEnum.individualsGetInstances]: 'auth(rdf(cls, instances), "R").',
        [VBActionsEnum.individualsRemoveType]: 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "D").',
        [VBActionsEnum.inputOutputClearData]: 'auth(rdf(code), "D").',
        [VBActionsEnum.inputOutputLoadData]: 'auth(rdf(code), "C").',
        [VBActionsEnum.invokableReporterCreate]: 'auth(invokableReporter(reporter), "C").',
        [VBActionsEnum.invokableReporterRead]: 'auth(invokableReporter(reporter), "R").',
        [VBActionsEnum.invokableReporterUpdate]: 'auth(invokableReporter(reporter), "U").',
        [VBActionsEnum.invokableReporterDelete]: 'auth(invokableReporter(reporter), "D").',
        [VBActionsEnum.invokableReporterSectionCreate]: 'auth(invokableReporter(reporter, section), "C").',
        [VBActionsEnum.invokableReporterSectionUpdate]: 'auth(invokableReporter(reporter, section), "U").',
        [VBActionsEnum.invokableReporterSectionDelete]: 'auth(invokableReporter(reporter, section), "D").',
        [VBActionsEnum.metadataAddImport]: 'auth(rdf(import), "C").',
        [VBActionsEnum.metadataChangeNsPrefixMapping]: 'auth(pm(project, prefixMapping), "U").',
        [VBActionsEnum.metadataReadImport]: 'auth(rdf(import), "R").',
        [VBActionsEnum.metadataRemoveImport]: 'auth(rdf(import), "D").',
        [VBActionsEnum.metadataRemoveNsPrefixMapping]: 'auth(pm(project, prefixMapping), "D").',
        [VBActionsEnum.metadataSetDefaultNs]: 'auth(pm(project, defnamespace), "U").',
        [VBActionsEnum.metadataSetNsPrefixMapping]: 'auth(pm(project, prefixMapping), "U").',
        [VBActionsEnum.metadataRegistryCreate]: 'auth(sys(metadataRegistry), "C").',
        [VBActionsEnum.metadataRegistryDelete]: 'auth(sys(metadataRegistry), "D").',
        [VBActionsEnum.metadataRegistryRead]: 'auth(sys(metadataRegistry), "R").',
        [VBActionsEnum.metadataRegistryUpdate]: 'auth(sys(metadataRegistry), "U").',
        [VBActionsEnum.ontManagerDeleteOntologyMirror]: 'auth(sys(ontologyMirror), "D").',
        [VBActionsEnum.ontManagerUpdateOntologyMirror]: 'auth(sys(ontologyMirror), "CU").',
        [VBActionsEnum.ontolexAddConcept]: 'auth(rdf(ontolexLexicalEntry, conceptualization), "C").',
        [VBActionsEnum.ontolexAddConceptualization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', conceptualization), "C").',
        [VBActionsEnum.ontolexAddDefinition]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', definitions), "C").',
        [VBActionsEnum.ontolexAddFormRepresentation]: 'auth(rdf(ontolexForm, formRepresentations), "C").',
        [VBActionsEnum.ontolexAddLexicalForm]: 'auth(rdf(ontolexLexicalEntry), "U").',
        [VBActionsEnum.ontolexAddLexicalization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "C").',
        [VBActionsEnum.ontolexAddOtherForm]: 'auth(rdf(ontolexLexicalEntry, lexicalForms), "C").',
        [VBActionsEnum.ontolexAddSubterm]: 'auth(rdf(ontolexLexicalEntry, subterms), "C").',
        [VBActionsEnum.ontolexClearLexicalEntryConstituent]: 'auth(rdf(ontolexLexicalEntry, constituents), "D").',
        [VBActionsEnum.ontolexCreateLexicalEntry]: 'auth(rdf(ontolexLexicalEntry), "C").',
        [VBActionsEnum.ontolexCreateLexicon]: 'auth(rdf(limeLexicon), "C").',
        [VBActionsEnum.ontolexCreateLexicoSemRelation]: 'auth(rdf, "C").',
        [VBActionsEnum.ontolexCreateTranslationSet]: 'auth(rdf(vartransTranslationSet), "C").',
        [VBActionsEnum.ontolexDeleteLexicalEntry]: 'auth(rdf(ontolexLexicalEntry), "D").',
        [VBActionsEnum.ontolexDeleteLexicalRelation]: 'auth(rdf(ontolexLexicalEntry, values), "D").',
        [VBActionsEnum.ontolexDeleteLexicon]: 'auth(rdf(limeLexicon), "D").',
        [VBActionsEnum.ontolexDeleteSenseRelation]: 'auth(rdf(ontolexLexicalSense, values), "D").',
        [VBActionsEnum.ontolexDeleteTranslationSet]: 'auth(rdf(vartransTranslationSet), "D").',
        [VBActionsEnum.ontolexGetLexicalEntry]: 'auth(rdf(ontolexLexicalEntry), "R").',
        [VBActionsEnum.ontolexGetLexicon]: 'auth(rdf(limeLexicon), "R").',
        [VBActionsEnum.ontolexGetTranslationSets]: 'auth(rdf(vartransTranslationSet), "R").',
        [VBActionsEnum.ontolexReadFormRepresentation]: 'auth(rdf(ontolexForm, formRepresentations), "R").',
        [VBActionsEnum.ontolexReadLexicalEntryConstituents]: 'auth(rdf(ontolexLexicalEntry, constituents), "R").',
        [VBActionsEnum.ontolexReadLexicaliForm]: 'auth(rdf(ontolexLexicalEntry, lexicalForms), "R").',
        [VBActionsEnum.ontolexReadSubterm]: 'auth(rdf(ontolexLexicalEntry, subterms), "R").',
        [VBActionsEnum.ontolexRemoveConcept]: 'auth(rdf(ontolexLexicalEntry, conceptualization), "D").',
        [VBActionsEnum.ontolexRemoveDefinition]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', definitions), "D").',
        [VBActionsEnum.ontolexRemoveForm]: 'auth(rdf(ontolexLexicalEntry, lexicalForms), "D").',
        [VBActionsEnum.ontolexRemoveFormRepresentation]: 'auth(rdf(ontolexForm, formRepresentations), "D").',
        [VBActionsEnum.ontolexRemoveLexicalForm]: 'auth(rdf(ontolexLexicalEntry, lexicalForms), "D").',
        [VBActionsEnum.ontolexRemovePlainLexicalization]: 'auth(rdf(resource, lexicalization), "D").',
        [VBActionsEnum.ontolexRemoveReifiedLexicalization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "D").',
        [VBActionsEnum.ontolexRemoveSubterm]: 'auth(rdf(ontolexLexicalEntry, subterms), "D").',
        [VBActionsEnum.ontolexSetCanonicalForm]: 'auth(rdf(ontolexLexicalEntry, lexicalForms), "C").',
        [VBActionsEnum.ontolexSetLexicalEntryConstituent]: 'auth(rdf(ontolexLexicalEntry, constituents), "C").',
        [VBActionsEnum.ontolexSetReference]: 'auth(rdf(resource, sense), "U").',
        [VBActionsEnum.ontolexUpdateDefinition]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', definitions), "U").',
        [VBActionsEnum.ontolexUpdateFormRepresentation]: 'auth(rdf(ontolexForm, formRepresentations), "U").',
        [VBActionsEnum.pluginsGetPlugins]: 'auth(sys(plugins), "R").',
        [VBActionsEnum.propertiesAddPropertyChainAxiom]: 'auth(rdf(property, taxonomy), "C").',
        [VBActionsEnum.propertiesAddPropertyDomain]: 'auth(rdf(property), "C").',
        [VBActionsEnum.propertiesAddPropertyRange]: 'auth(rdf(property), "C").',
        [VBActionsEnum.propertiesAddSuperProperty]: 'auth(rdf(property, taxonomy), "C").',
        [VBActionsEnum.propertiesAddDisjointProperty]: 'auth(rdf(property, taxonomy), "C").',
        [VBActionsEnum.propertiesAddEquivalentProperty]: 'auth(rdf(property, taxonomy), "C").',
        [VBActionsEnum.propertiesCreateProperty]: 'auth(rdf(property), "C").',
        [VBActionsEnum.propertiesCreateSubProperty]: 'auth(rdf(property), "C").',
        [VBActionsEnum.propertiesDeleteProperty]: 'auth(rdf(property), "D").',
        [VBActionsEnum.propertiesGetDomain]: 'auth(rdf(property, domain), "R").',
        [VBActionsEnum.propertiesGetPropertyTaxonomy]: 'auth(rdf(property, taxonomy), "R").',
        [VBActionsEnum.propertiesGetRange]: 'auth(rdf(property, range), "R").',
        [VBActionsEnum.propertiesRead]: 'auth(rdf(property), "D").',
        [VBActionsEnum.propertiesReadPropertyChainAxiom]: 'auth(rdf(property, taxonomy), "R").',
        [VBActionsEnum.propertiesRemovePropertyChainAxiom]: 'auth(rdf(property, taxonomy), "D").',
        [VBActionsEnum.propertiesRemovePropertyDomain]: 'auth(rdf(property), "D").',
        [VBActionsEnum.propertiesRemovePropertyRange]: 'auth(rdf(property), "D").',
        [VBActionsEnum.propertiesRemoveSuperProperty]: 'auth(rdf(property, taxonomy), "D").',
        [VBActionsEnum.propertiesRemoveDisjointProperty]: 'auth(rdf(property, taxonomy), "D").',
        [VBActionsEnum.propertiesRemoveEquivalentProperty]: 'auth(rdf(property, taxonomy), "D").',
        [VBActionsEnum.propertiesUpdatePropertyChainAxiom]: 'auth(rdf(property, taxonomy), "U").',
        [VBActionsEnum.refactorChangeResourceUri]: 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "U").',
        [VBActionsEnum.refactorMigrateToBaseUriGraph]: 'auth(rdf(code), "CRUD").',
        [VBActionsEnum.refactorMoveXLabelToResource]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "CD").',
        [VBActionsEnum.refactorReplaceBaseUri]: 'auth(rdf(code), "CRUD").',
        [VBActionsEnum.refactorSkosToSkosxl]: 'auth(lexicalization, "CD").',
        [VBActionsEnum.refactorSkosxlToSkos]: 'auth(lexicalization, "CD").',
        [VBActionsEnum.refactorSpawnNewConceptFromLabel]: 'auth(rdf(concept), "C").',
        [VBActionsEnum.remoteAlignmentServiceSet]: 'auth(pm(project, alignmentService), "C").',
        [VBActionsEnum.remoteAlignmentServiceRead]: 'auth(pm(project, alignmentService), "R").',
        [VBActionsEnum.remoteAlignmentServiceRemove]: 'auth(pm(project, alignmentService), "D").',
        [VBActionsEnum.resourcesAddValue]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', values), "C").',
        [VBActionsEnum.resourcesRead]: 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "R").',
        [VBActionsEnum.resourcesReadLexicalizations]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "R").',
        [VBActionsEnum.resourcesRemoveValue]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', values), "D").',
        [VBActionsEnum.resourcesRemovePredicateObject]: 'auth(rdf(resource, values), "D").',
        [VBActionsEnum.resourcesSetDeprecated]: 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "U").',
        [VBActionsEnum.resourcesUpdateLexicalization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "U").',
        [VBActionsEnum.resourcesUpdateTriple]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', values), "U").',
        [VBActionsEnum.resourcesUpdatePredicateObject]: 'auth(rdf(resource, values), "U").',
        [VBActionsEnum.resourcesUpdateResourceTriplesDescription]: 'auth(rdf(code), "U").',
        [VBActionsEnum.resourcesGetResourceTriplesDescription]: 'auth(rdf(code), "R").',
        [VBActionsEnum.resourcesGetResourcePosition]: 'auth(rdf(resource), "R").',
        [VBActionsEnum.resourceMetadataAssociationCreate]: 'auth(pm(resourceMetadata,association), "C").',
        [VBActionsEnum.resourceMetadataAssociationDelete]: 'auth(pm(resourceMetadata,association), "D").',
        [VBActionsEnum.resourceMetadataAssociationRead]: 'auth(pm(resourceMetadata,association), "R").',
        [VBActionsEnum.resourceMetadataPatternCreate]: 'auth(pm(resourceMetadata,pattern), "C").',
        [VBActionsEnum.resourceMetadataPatternDelete]: 'auth(pm(resourceMetadata,pattern), "D").',
        [VBActionsEnum.resourceMetadataPatternRead]: 'auth(pm(resourceMetadata,pattern), "R").',
        [VBActionsEnum.resourceMetadataPatternUpdate]: 'auth(pm(resourceMetadata,pattern), "U").',
        [VBActionsEnum.resourceViewGetResourceView]: 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "R").',
        [VBActionsEnum.shaclBatchValidation]: 'auth(rdf, "R").',
        [VBActionsEnum.shaclClearShapes]: 'auth(rdf(shacl), "D").',
        [VBActionsEnum.shaclExportShapes]: 'auth(rdf(shacl), "R").',
        [VBActionsEnum.shaclLoadShapes]: 'auth(rdf(shacl), "CU").',
        [VBActionsEnum.shaclExtractCF]: 'auth(rdf(shacl), "R").',
        [VBActionsEnum.sheet2Rdf]: 'auth(rdf(code), "CRUD").',
        [VBActionsEnum.skosAddBroaderConcept]: 'auth(rdf(concept, taxonomy), "C").',
        [VBActionsEnum.skosAddConceptToScheme]: 'auth(rdf(concept, schemes), "C").',
        [VBActionsEnum.skosAddLexicalization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "C").',
        [VBActionsEnum.skosAddMultipleToScheme]: 'auth(rdf(concept, schemes), "C").',
        [VBActionsEnum.skosAddNote]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', notes), "C").',
        [VBActionsEnum.skosAddToCollection]: 'auth(rdf(skosCollection), "U").', //TODO is it ok? or add values (skosCollection, values)
        [VBActionsEnum.skosAddTopConcept]: 'auth(rdf(concept, schemes), "C").',
        [VBActionsEnum.skosCreateCollection]: 'auth(rdf(skosCollection), "C").',
        [VBActionsEnum.skosCreateSubCollection]: 'auth(rdf(skosCollection), "C").',
        [VBActionsEnum.skosCreateNarrowerConcept]: 'auth(rdf(concept), "C").',
        [VBActionsEnum.skosCreateTopConcept]: 'auth(rdf(concept), "C").',
        [VBActionsEnum.skosCreateScheme]: 'auth(rdf(conceptScheme), "C").',
        [VBActionsEnum.skosDeleteCollection]: 'auth(rdf(skosCollection), "D").',
        [VBActionsEnum.skosDeleteConcept]: 'auth(rdf(concept), "D").',
        [VBActionsEnum.skosDeleteScheme]: 'auth(rdf(conceptScheme), "D").',
        [VBActionsEnum.skosGetCollectionTaxonomy]: 'auth(rdf(skosCollection, taxonomy), "R").',
        [VBActionsEnum.skosGetConceptTaxonomy]: 'auth(rdf(concept, taxonomy), "R").',
        [VBActionsEnum.skosGetSchemes]: 'auth(rdf(conceptScheme), "R").',
        [VBActionsEnum.skosReadSchemes]: 'auth(rdf(concept, schemes), "R").',
        [VBActionsEnum.skosRemoveBroaderConcept]: 'auth(rdf(concept, taxonomy), "D").',
        [VBActionsEnum.skosRemoveConceptFromScheme]: 'auth(rdf(concept, schemes), "D").',
        [VBActionsEnum.skosRemoveFromCollection]: 'auth(rdf(skosCollection), "U").', //TODO is it ok? or add values (skosCollection, values)
        [VBActionsEnum.skosRemoveLexicalization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "D").',
        [VBActionsEnum.skosRemoveNote]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', notes), "D").',
        [VBActionsEnum.skosRemoveTopConcept]: 'auth(rdf(concept, schemes), "D").',
        [VBActionsEnum.skosUpdateNote]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', notes), "U").',
        [VBActionsEnum.sparqlEvaluateQuery]: 'auth(rdf(sparql), "R").',
        [VBActionsEnum.sparqlExecuteUpdate]: 'auth(rdf(sparql), "U").',
        [VBActionsEnum.validation]: 'auth(rdf(code), "V").',
        [VBActionsEnum.versionsCreateVersionDump]: 'auth(rdf(dataset, version), "C").',
        [VBActionsEnum.versionsDeleteVersions]: 'auth(rdf(dataset, version), "D").',
        [VBActionsEnum.versionsGetVersions]: 'auth(rdf(dataset, version), "R").',
        [VBActionsEnum.visualizationWidgetsRead]: 'auth(pm(widget), "R").'
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
     * Check if a VBAction is authorized
     * @param action 
     * @param resource If provided, is used to get its role 
     * @param langValue If provided, check if it is a language tagged resource and the user has the permission
     */
    public static isAuthorized(action: VBActionsEnum, resource?: ARTResource, langValue?: ARTNode): boolean {
        let goal: string = this.actionAuthGoalMap[action]; //retrieves the action goal and call isGaolAuthorized
        return AuthorizationEvaluator.isGaolAuthorized(goal, resource, langValue);
    }

    /**
     * Check if a goal is authorized
     * @param goal 
     * @param resource 
     * @param langValue 
     */
    public static isGaolAuthorized(goal: string, resource?: ARTResource, langValue?: ARTNode): boolean {
        var user: User = VBContext.getLoggedUser();
        if (user == null) {
            return false;
        }
        if (user.isAdmin()) {
            return true;
        } else {
            //check language authorization
            if (langValue != null && langValue.getAdditionalProperty(ResAttribute.LANG)) {
                let userLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
                if (!userLangs.some(l => l.toLowerCase() == langValue.getAdditionalProperty(ResAttribute.LANG).toLowerCase())) {
                    return false;
                }
            }

            if (AuthorizationEvaluator.prologEngine == null) { //engine not yet initialized
                return false;
            }
            //evaluate if the user capabilities satisfy the authorization requirement
            if (goal.includes(AuthorizationEvaluator.resRole)) {//dynamic goal (depending on resource role)
                if (resource != null) {
                    goal = goal.replace(AuthorizationEvaluator.resRole, resource.getRole());
                } else {
                    throw new Error("Cannot resolve the authorization goal: goal depends on resource role, but resource is undefined");
                }
            }
            return this.evaulateGoal(goal);
        }
    }

    static evaulateGoal(goal: string): boolean {
        let cachedAuth: boolean = this.authCache[goal];
        if (cachedAuth != null) { //if it was chached => return it
            return cachedAuth;
        } else { //...otherwise compute authorization
            let query = Prolog.Parser.parseQuery(goal);
            let iter = Prolog.Solver.query(AuthorizationEvaluator.prologEngine, query);
            let authorized: boolean = iter.next();
            //cache the result of the evaluation for the given goal
            this.authCache[goal] = authorized;
            return authorized;
        }
    }


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

        chk_capability(rdf(ONTOLEXELEMENT), CRUDV) :-
        	capability(rdf(ontolex), CRUDV),
	        vocabulary(ONTOLEXELEMENT, ontolex).
	
        chk_capability(rdf(ONTOLEXELEMENT,_), CRUDV) :-
            capability(rdf(ontolex), CRUDV),
            vocabulary(ONTOLEXELEMENT, ontolex).
        
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

        chk_capability(rdf(ontolexForm), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(ontolexForm,_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).	
            
        chk_capability(rdf(ontolexLexicalEntry), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(ontolexLexicalEntry,_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).		
        
        chk_capability(rdf(limeLexicon), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(limeLexicon,_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).			
            
        chk_capability(rdf(_,notes), CRUDV) :-
            capability(rdf(notes), CRUDV).

        chk_capability(rbac(_), CRUDV) :-	
            chk_capability(rbac, CRUDV).	

        chk_capability(rbac(_,_), CRUDV) :-	
            chk_capability(rbac, CRUDV).

        chk_capability(cform(_), CRUDV) :-	
            chk_capability(cform, CRUDV).	
        
        chk_capability(cform(_,_), CRUDV) :-	
            chk_capability(cform, CRUDV).

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
        role(ontolexForm).
        role(ontolexLexicalEntry).
        role(limeLexicon).
        role(decompComponent).

        vocabulary(concept, skos).
        vocabulary(conceptScheme, skos).
        vocabulary(skosCollection, skos).

        vocabulary(ontolexForm, ontolex).
        vocabulary(ontolexLexicalEntry, ontolex).
        vocabulary(limeLexicon, ontolex).
        vocabulary(decompComponent, ontolex).
        
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

export enum CRUDEnum {
    C = "C",
    R = "R",
    U = "U",
    D = "D",
    V = "V",
}

export class ResourceViewAuthEvaluator {

    private static customSectionEvalMap: CrudEvaluationMap = {
        [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value),
        [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value),
        [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
        [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value),
    }

    /**
     * Mapping between resource view partition and authorization evaluation for each kind of action available in RV (CRUD)
     */
    private static partitionEvaluationMap: PartitionEvaluationMap = {
        [ResViewPartition.broaders]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddBroaderConcept, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetConceptTaxonomy, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveBroaderConcept, resource, value),
        },
        [ResViewPartition.classaxioms]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesCreateClassAxiom, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesRemoveClassAxiom, resource, value),
        },
        [ResViewPartition.constituents]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexSetLexicalEntryConstituent, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexReadLexicalEntryConstituents, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexClearLexicalEntryConstituent, resource, value),
        },
        [ResViewPartition.datatypeDefinitions]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesSetDatatypeRestriction, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesSetDatatypeRestriction, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesDeleteDatatypeRestriction, resource, value),
        },
        [ResViewPartition.denotations]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalization, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesReadLexicalizations, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemovePlainLexicalization, resource, value),
        },
        [ResViewPartition.disjointProperties]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddDisjointProperty, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveDisjointProperty, resource, value),
        },
        [ResViewPartition.domains]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyDomain, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetDomain, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyDomain, resource, value),
        },
        [ResViewPartition.equivalentProperties]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddEquivalentProperty, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveEquivalentProperty, resource, value),
        },
        [ResViewPartition.evokedLexicalConcepts]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value),
        },
        [ResViewPartition.facets]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value),
        },
        [ResViewPartition.formBasedPreview]: { //only read partition
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => false,
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => true,
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => false,
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => false,
        },
        [ResViewPartition.formRepresentations]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddFormRepresentation, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexReadFormRepresentation, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveFormRepresentation, resource, value),
        },
        [ResViewPartition.imports]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataAddImport, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataReadImport, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRemoveImport, resource, value),
        },
        [ResViewPartition.labelRelations]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value),
        },
        [ResViewPartition.lexicalForms]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalForm, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveLexicalForm, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveLexicalForm, resource, value),
        },
        [ResViewPartition.lexicalSenses]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalization, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesReadLexicalizations, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveReifiedLexicalization, resource, value),
        },
        [ResViewPartition.lexicalizations]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddLexicalization, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesReadLexicalizations, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateLexicalization, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveLexicalization, resource, value),
        },
        [ResViewPartition.members]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddToCollection, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetCollectionTaxonomy, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveFromCollection, resource, value),
        },
        [ResViewPartition.membersOrdered]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddToCollection, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetCollectionTaxonomy, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveFromCollection, resource, value),
        },
        [ResViewPartition.notes]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddNote, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosUpdateNote, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveNote, resource, value),
        },
        [ResViewPartition.properties]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value),
        },
        [ResViewPartition.ranges]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyRange, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetRange, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyRange, resource, value),
        },
        [ResViewPartition.rdfsMembers]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value),
        },
        [ResViewPartition.schemes]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddConceptToScheme, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosReadSchemes, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveConceptFromScheme, resource, value),
        },
        [ResViewPartition.subPropertyChains]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyChainAxiom, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesReadPropertyChainAxiom, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesUpdatePropertyChainAxiom, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyChainAxiom, resource, value),
        },
        [ResViewPartition.subterms]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddSubterm, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexReadSubterm, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveSubterm, resource, value),
        },
        [ResViewPartition.superproperties]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddSuperProperty, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetPropertyTaxonomy, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveSuperProperty, resource, value),
        },
        [ResViewPartition.topconceptof]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddTopConcept, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosReadSchemes, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveTopConcept, resource, value),
        },
        [ResViewPartition.types]: {
            [CRUDEnum.C]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.individualsAddType, resource, value),
            [CRUDEnum.R]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value),
            [CRUDEnum.U]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value),
            [CRUDEnum.D]: (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.individualsRemoveType, resource, value),
        },
    };

    /**
     * @param partition ResView partition (e.g. types, topconceptof) of the CRUD to control
     * @param crud CRUD to check
     * @param resource resource described in the ResView
     * @param value value described in the specific predicate-object widget (if provided useful for language checks)
     */
    public static isAuthorized(partition: ResViewPartition, crud: CRUDEnum, resource: ARTResource, value?: ARTNode): boolean {
        let crudEvalMap: CrudEvaluationMap = this.partitionEvaluationMap[partition];
        let evaluationFn: EvaluationFn;
        if (crudEvalMap != null) {
            evaluationFn = crudEvalMap[crud];
        } else { //probably a custom partition
            evaluationFn =  this.customSectionEvalMap[crud];
        }
        return evaluationFn(resource, value);
    }

}

// interface CrudEvaluationMap extends Map<CRUDEnum, EvaluationFn> { }

//workaroung for using enum as key (https://github.com/microsoft/TypeScript/issues/24220)
//"?" for the key is because I don't want all the Enum values to be included forcefully
type PartitionEvaluationMap = {
    [key in ResViewPartition]?: CrudEvaluationMap 
}
type CrudEvaluationMap = {
    [key in CRUDEnum]?: EvaluationFn //"?" for the key is because I don't want all the Enum values to be included forcefully
}
interface EvaluationFn { (resource: ARTResource, value: ARTNode): boolean }

