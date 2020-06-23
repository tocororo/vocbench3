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
        [VBActionsEnum.customFormCreateCollection]: 'auth(cform(formCollection), "C").',
        [VBActionsEnum.customFormCreateForm]: 'auth(cform(formCollection), "C").',
        [VBActionsEnum.customFormDeleteFormMapping]: 'auth(cform(form, mapping), "D").',
        [VBActionsEnum.customFormDeleteCollection]: 'auth(cform(formCollection), "D").',
        [VBActionsEnum.customFormDeleteForm]: 'auth(cform(form), "D").',
        [VBActionsEnum.customFormGetFormMappings]: 'auth(cform(formCollection), "R").',
        [VBActionsEnum.customFormGetCollections]: 'auth(cform(formCollection), "R").',
        [VBActionsEnum.customFormGetForms]: 'auth(cform(form), "R").',
        [VBActionsEnum.customFormUpdateFormMapping]: 'auth(cform(form, mapping), "U").',
        [VBActionsEnum.customFormUpdateCollection]: 'auth(cform(formCollection), "U").',
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
        [VBActionsEnum.exportExport]: 'auth(rdf, "R").',
        [VBActionsEnum.history]: 'auth(rdf, "R").',
        [VBActionsEnum.icvDanglingXLabel]: 'auth(rdf(xLabel), "R").',
        [VBActionsEnum.icvGenericConcept]: 'auth(rdf(concept), "R").',
        [VBActionsEnum.icvGenericResource]: 'auth(rdf(resource), "R").',
        [VBActionsEnum.individualsAddType]: 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "U").',
        [VBActionsEnum.individualsGetInstances]: 'auth(rdf(cls, instances), "R").',
        [VBActionsEnum.individualsRemoveType]: 'auth(rdf(' + AuthorizationEvaluator.resRole + '), "D").',
        [VBActionsEnum.inputOutputClearData]: 'auth(rdf, "D").',
        [VBActionsEnum.inputOutputLoadData]: 'auth(rdf, "C").',
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
        [VBActionsEnum.ontolexAddFormRepresentation]: 'auth(rdf(ontolexForm, formRepresentations), "C").',
        [VBActionsEnum.ontolexAddLexicalForm]: 'auth(rdf(ontolexLexicalEntry), "U").',
        [VBActionsEnum.ontolexAddLexicalization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "C").',
        [VBActionsEnum.ontolexAddSubterm]: 'auth(rdf(ontolexLexicalEntry, subterms), "C").',
        [VBActionsEnum.ontolexClearLexicalEntryConstituent]: 'auth(rdf(ontolexLexicalEntry, constituents), "D").',
        [VBActionsEnum.ontolexCreateLexicalEntry]: 'auth(rdf(ontolexLexicalEntry), "C").',
        [VBActionsEnum.ontolexCreateLexicon]: 'auth(rdf(limeLexicon), "C").',
        [VBActionsEnum.ontolexDeleteLexicalEntry]: 'auth(rdf(ontolexLexicalEntry), "D").',
        [VBActionsEnum.ontolexDeleteLexicon]: 'auth(rdf(limeLexicon), "D").',
        [VBActionsEnum.ontolexGetLexicalEntry]: 'auth(rdf(ontolexLexicalEntry), "R").',
        [VBActionsEnum.ontolexGetLexicon]: 'auth(rdf(limeLexicon), "R").',
        [VBActionsEnum.ontolexReadFormRepresentation]: 'auth(rdf(ontolexForm, formRepresentations), "R").',
        [VBActionsEnum.ontolexReadLexicalEntryConstituents]: 'auth(rdf(ontolexLexicalEntry, constituents), "R").',
        [VBActionsEnum.ontolexReadLexicaliForm]: 'auth(rdf(ontolexLexicalEntry, lexicalForms), "R").',
        [VBActionsEnum.ontolexReadSubterm]: 'auth(rdf(ontolexLexicalEntry, subterms), "R").',
        [VBActionsEnum.ontolexRemoveFormRepresentation]: 'auth(rdf(ontolexForm, formRepresentations), "U").',
        [VBActionsEnum.ontolexRemoveLexicalForm]: 'auth(rdf(ontolexLexicalEntry, lexicalForms), "D").',
        [VBActionsEnum.ontolexRemovePlainLexicalization]: 'auth(rdf(resource, lexicalization), "D").',
        [VBActionsEnum.ontolexRemoveReifiedLexicalization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "D").',
        [VBActionsEnum.ontolexRemoveSubterm]: 'auth(rdf(ontolexLexicalEntry, subterms), "D").',
        [VBActionsEnum.ontolexSetLexicalEntryConstituent]: 'auth(rdf(ontolexLexicalEntry, constituents), "C").',
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
        [VBActionsEnum.refactorMigrateToBaseUriGraph]: 'auth(rdf, "CRUD").',
        [VBActionsEnum.refactorMoveXLabelToResource]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "CD").',
        [VBActionsEnum.refactorReplaceBaseUri]: 'auth(rdf, "CRUD").',
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
        [VBActionsEnum.resourcesUpdateResourceTriplesDescription]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', values), "U").',
        [VBActionsEnum.resourcesGetResourceTriplesDescription]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', values), "R").',
        [VBActionsEnum.resourceMetadataAssociationCreate]: 'auth(pm(resourceMetadata,association), "C").',
        [VBActionsEnum.resourceMetadataAssociationDelete]: 'auth(pm(resourceMetadata,association), "D").',
        [VBActionsEnum.resourceMetadataAssociationRead]: 'auth(pm(resourceMetadata,association), "R").',
        [VBActionsEnum.resourceMetadataPatternCreate]: 'auth(pm(resourceMetadata,pattern), "C").',
        [VBActionsEnum.resourceMetadataPatternDelete]: 'auth(pm(resourceMetadata,pattern), "D").',
        [VBActionsEnum.resourceMetadataPatternRead]: 'auth(pm(resourceMetadata,pattern), "R").',
        [VBActionsEnum.resourceMetadataPatternUpdate]: 'auth(pm(resourceMetadata,pattern), "U").',
        [VBActionsEnum.shaclClearShapes]: 'auth(shacl, "D").',
        [VBActionsEnum.shaclExportShapes]: 'auth(shacl, "R").',
        [VBActionsEnum.shaclLoadShapes]: 'auth(shacl, "CU").',
        [VBActionsEnum.shaclExtractCF]: 'auth(shacl, "R").',
        [VBActionsEnum.sheet2Rdf]: 'auth(rdf, "CRUD").',
        [VBActionsEnum.skosAddBroaderConcept]: 'auth(rdf(concept, taxonomy), "C").',
        [VBActionsEnum.skosAddConceptToScheme]: 'auth(rdf(concept, schemes), "C").',
        [VBActionsEnum.skosAddLexicalization]: 'auth(rdf(' + AuthorizationEvaluator.resRole + ', lexicalization), "C").',
        [VBActionsEnum.skosAddMultipleToScheme]: 'auth(rdf(concept, schemes), "C").',
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
        [VBActionsEnum.skosRemoveTopConcept]: 'auth(rdf(concept, schemes), "D").',
        [VBActionsEnum.sparqlEvaluateQuery]: 'auth(rdf(sparql), "R").',
        [VBActionsEnum.sparqlExecuteUpdate]: 'auth(rdf(sparql), "U").',
        [VBActionsEnum.validation]: 'auth(rdf, "V").',
        [VBActionsEnum.versionsCreateVersionDump]: 'auth(rdf(dataset, version), "C").',
        [VBActionsEnum.versionsGetVersions]: 'auth(rdf(dataset, version), "R").',
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
     * @param langValue If provided, check if it is a language tagged resource and the user has the permission
     */
    public static isAuthorized(action: VBActionsEnum, resource?: ARTResource, langValue?: ARTNode): boolean {
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

export enum CRUDEnum {
    C = "C",
    R = "R",
    U = "U",
    D = "D",
    V = "V",
}

export class ResourceViewAuthEvaluator {

    /**
     * Mapping between resource view partition and authorization evaluation for each kind of action available in RV (CRUD)
     */
    private static partitionEvaluationMap: Map<ResViewPartition, CrudEvaluationMap> = new Map([
        [
            ResViewPartition.broaders,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddBroaderConcept, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetConceptTaxonomy, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveBroaderConcept, resource, value)],
            ]),
        ],
        [
            ResViewPartition.classaxioms,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesCreateClassAxiom, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesRemoveClassAxiom, resource, value)],
            ])
        ],
        [
            ResViewPartition.constituents,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexSetLexicalEntryConstituent, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexReadLexicalEntryConstituents, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexClearLexicalEntryConstituent, resource, value)],
            ])
        ],
        [
            ResViewPartition.datatypeDefinitions,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesSetDatatypeRestriction, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesSetDatatypeRestriction, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesDeleteDatatypeRestriction, resource, value)],
            ])
        ],
        [
            ResViewPartition.denotations,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalization, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesReadLexicalizations, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemovePlainLexicalization, resource, value)],
            ])
        ],
        [
            ResViewPartition.disjointProperties,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddDisjointProperty, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveDisjointProperty, resource, value)],
            ])
        ],
        [
            ResViewPartition.domains,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyDomain, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetDomain, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyDomain, resource, value)],
            ])
        ],
        [
            ResViewPartition.equivalentProperties,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddEquivalentProperty, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveEquivalentProperty, resource, value)],
            ])
        ],
        [
            ResViewPartition.evokedLexicalConcepts,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value)],
            ])
        ],
        [
            ResViewPartition.facets,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value)],
            ])
        ],
        [
            ResViewPartition.formBasedPreview, //only read partition
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => false],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => true],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => false],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => false],
            ])
        ],
        [
            ResViewPartition.formRepresentations,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddFormRepresentation, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexReadFormRepresentation, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveFormRepresentation, resource, value)],
            ])
        ],
        [
            ResViewPartition.imports,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataAddImport, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataReadImport, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRemoveImport, resource, value)],
            ])
        ],
        [
            ResViewPartition.labelRelations,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value)],
            ])
        ],
        [
            ResViewPartition.lexicalForms,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalForm, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveLexicalForm, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveLexicalForm, resource, value)],
            ])
        ],
        [
            ResViewPartition.lexicalSenses,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalization, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesReadLexicalizations, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveReifiedLexicalization, resource, value)],
            ])
        ],
        [
            ResViewPartition.lexicalizations,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddLexicalization, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesReadLexicalizations, resource, value)],
                // [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateLexicalization, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveLexicalization, resource, value)],
            ])
        ],
        [
            ResViewPartition.members,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddToCollection, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetCollectionTaxonomy, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveFromCollection, resource, value)],
            ])
        ],
        [
            ResViewPartition.membersOrdered,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddToCollection, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosGetCollectionTaxonomy, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveFromCollection, resource, value)],
            ])
        ],
        [
            ResViewPartition.notes,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value)],
            ])
        ],
        [
            ResViewPartition.properties,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value)],
            ])
        ],
        [
            ResViewPartition.ranges,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyRange, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetRange, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyRange, resource, value)],
            ])
        ],
        [
            ResViewPartition.rdfsMembers,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, resource, value)],
            ])
        ],
        [
            ResViewPartition.schemes,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddConceptToScheme, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosReadSchemes, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveConceptFromScheme, resource, value)],
            ])
        ],
        [
            ResViewPartition.subPropertyChains,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddPropertyChainAxiom, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesReadPropertyChainAxiom, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesUpdatePropertyChainAxiom, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemovePropertyChainAxiom, resource, value)],
            ])
        ],
        [
            ResViewPartition.subterms,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddSubterm, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexReadSubterm, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveSubterm, resource, value)],
            ])
        ],
        [
            ResViewPartition.superproperties,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesAddSuperProperty, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesGetPropertyTaxonomy, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.propertiesRemoveSuperProperty, resource, value)],
            ])
        ],
        [
            ResViewPartition.topconceptof,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddTopConcept, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosReadSchemes, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosRemoveTopConcept, resource, value)],
            ])
        ],
        [
            ResViewPartition.types,
            new Map([
                [CRUDEnum.C, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.individualsAddType, resource, value)],
                [CRUDEnum.R, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRead, resource, value)],
                [CRUDEnum.U, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, resource, value)],
                [CRUDEnum.D, (resource: ARTResource, value: ARTNode) => AuthorizationEvaluator.isAuthorized(VBActionsEnum.individualsRemoveType, resource, value)],
            ])
        ],
    ]);

    /**
     * @param partition ResView partition (e.g. types, topconceptof) of the CRUD to control
     * @param crud CRUD to check
     * @param resource resource described in the ResView
     * @param value value described in the specific predicate-object widget (if provided useful for language checks)
     */
    public static isAuthorized(partition: ResViewPartition, crud: CRUDEnum, resource: ARTResource, value?: ARTNode): boolean {
        let evaluationFn: EvaluationFn = this.partitionEvaluationMap.get(partition).get(crud);
        return evaluationFn(resource, value);
    }

}

interface CrudEvaluationMap extends Map<CRUDEnum, EvaluationFn> { }
interface EvaluationFn { (resource: ARTResource, value: ARTNode): boolean }

