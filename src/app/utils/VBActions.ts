import { ElementRef } from "@angular/core";
import { Observable, Observer } from "rxjs";
import { ARTURIResource } from "../models/ARTResources";
import { OntoLex, OWL, RDFS, SKOS } from "../models/Vocabulary";
import { ClassesServices } from "../services/classesServices";
import { DatatypesServices } from "../services/datatypesServices";
import { OntoLexLemonServices } from "../services/ontoLexLemonServices";
import { PropertyServices } from "../services/propertyServices";
import { ResourcesServices } from "../services/resourcesServices";
import { SkosServices } from "../services/skosServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";
import { NewLexiconCfModalReturnData } from "../widget/modal/creationModal/newResourceModal/ontolex/newLexiconCfModal";
import { NewResourceWithLiteralCfModalReturnData } from "../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal";
import { NewConceptCfModalReturnData } from "../widget/modal/creationModal/newResourceModal/skos/newConceptCfModal";
import { HttpServiceContext } from "./HttpManager";
import { UIUtils } from "./UIUtils";

/**
 * The following represents a list of action available in ST-VB.
 * Almost all the actions have a corresponding service in ST. 
 * Some of them instead are only "dummy" actions used for representing generic read actions for which exist 
 * authorization checks for the UI (e.g. the generic read actions, like classesRead, ...)
 */
export enum VBActionsEnum {
    //Administration
    administrationProjectManagement = "administrationProjectManagement", //generic for management of project
    administrationRoleManagement = "administrationRoleManagement", //generic for management of roles
    administrationUserGroupManagement = "administrationUserGroupManagement", //generic for management of user-groups
    administrationUserRoleManagement = "administrationUserRoleManagement", //generic for management of user-roles
    //Alignment
    alignmentAddAlignment = "alignmentAddAlignment",
    alignmentLoadAlignment = "alignmentLoadAlignment",
    //Classes
    classesCreateClass = "classesCreateClass",
    classesCreateSubClass = "classesCreateSubClass",
    classesCreateClassAxiom = "classesCreateClassAxiom", //generic for addOneOf/UnionOf/IntersectionOf
    classesCreateIndividual = "classesCreateIndividual",
    classesDeleteClass = "classesDeleteClass",
    classesDeleteIndividual = "classesDeleteIndividual",
    classesGetClassTaxonomy = "classesGetClassTaxonomy", //valid for getClassesInfo and getSubClasses
    classesGetInstances = "classesGetInstances",
    classesRead = "classesRead", //action for generic read (e.g. getClassInfo)
    classesRemoveClassAxiom = "classesRemoveClassAxiom",
    //Collaboration
    collaboration = "collaboration", //generic for Collaboration (creation and assignment of CS project)
    //CustomForm
    customFormCreateCollection = "customFormCreateCollection",
    customFormCreateForm = "customFormCreateForm",
    customFormCreateFormMapping = "customFormCreateFormMapping",
    customFormDeleteCollection = "customFormDeleteCollection",
    customFormDeleteForm = "customFormDeleteForm",
    customFormDeleteFormMapping = "customFormDeleteFormMapping",
    customFormGetCollections = "customFormGetCollections",
    customFormGetFormMappings = "customFormGetFormMappings",
    customFormGetForms = "customFormGetForms",
    customFormUpdateCollection = "customFormUpdateCollection",
    customFormUpdateForm = "customFormUpdateForm",
    customFormUpdateFormMapping = "customFormUpdateFormMapping",
    //DatasetMetadata
    datasetMetadataExport = "datasetMetadataExport",
    datasetMetadataGetMetadata = "datasetMetadataGetMetadata",
    //Datatypes
    datatypesCreateDatatype = "datatypesCreateDatatype",
    datatypesDeleteDatatype = "datatypesDeleteDatatype",
    datatypesGetDatatype = "datatypesGetDatatype",
    datatypesDeleteDatatypeRestriction = "datatypesDeleteDatatypeRestriction",
    datatypesRead = "datatypesRead",
    datatypesSetDatatypeRestriction = "setDatatypeRestriction", //generic for all the kinds of restriction
    //Export
    exportExport = "exportExport",
    //History
    history = "history", //generic
    //ICV
    icvDanglingXLabel = "icvDanglingXLabel",
    icvGenericConcept = "icvGenericConcept",
    icvGenericResource = "icvGenericResource",
    //Individuals
    individualsAddType = "individualsAddType",
    individualsGetInstances = "individualsGetInstances",
    individualsRemoveType = "individualsRemoveType",
    //InputOutput
    inputOutputClearData = "inputOutputClearData",
    inputOutputLoadData = "inputOutputLoadData",
    //Metadata
    metadataAddImport = "metadataAddImport",
    metadataChangeNsPrefixMapping = "metadataChangeNsPrefixMapping",
    metadataReadImport = "metadataReadImport",
    metadataRemoveImport = "metadataRemoveImport",
    metadataRemoveNsPrefixMapping = "metadataRemoveNsPrefixMapping",
    metadataSetDefaultNs = "metadataSetDefaultNs",
    metadataSetNsPrefixMapping = "metadataSetNsPrefixMapping",
    //MetadataRegistry
    metadataRegistryCreate = "metadataRegistryCreate",
    metadataRegistryDelete = "metadataRegistryDelete",
    metadataRegistryRead = "metadataRegistryRead",
    metadataRegistryUpdate = "metadataRegistryUpdate",
    //OntManager
    ontManagerDeleteOntologyMirror = "ontManagerDeleteOntologyMirror",
    ontManagerUpdateOntologyMirror = "ontManagerUpdateOntologyMirror",
    //Ontolex
    ontolexAddFormRepresentation = "ontolexAddFormRepresentation",
    ontolexAddLexicalForm = "ontolexAddLexicalForm",
    ontolexAddLexicalization = "ontolexAddLexicalization",
    ontolexAddSubterm = "ontolexAddSubterm",
    ontolexClearLexicalEntryConstituent = "ontolexClearLexicalEntryConstituent",
    ontolexCreateLexicalEntry = "ontolexCreateLexicalEntry",
    ontolexCreateLexicon = "ontolexCreateLexicon",
    ontolexDeleteLexicalEntry = "ontolexDeleteLexicalEntry",
    ontolexDeleteLexicon = "ontolexDeleteLexicon",
    ontolexGetLexicalEntry = "ontolexGetLexicalEntry",
    ontolexGetLexicon = "ontolexGetLexicon",
    ontolexReadFormRepresentation = "ontolexReadFormRepresentation",
    ontolexReadLexicaliForm = "ontolexReadLexicaliForm",
    ontolexReadLexicalEntryConstituents = "ontolexReadLexicalEntryConstituents",
    ontolexReadSubterm = "ontolexReadSubterm",
    ontolexRemoveFormRepresentation = "ontolexRemoveFormRepresentation",
    ontolexRemoveLexicalForm = "ontolexRemoveLexicalForm",
    ontolexRemovePlainLexicalization = "ontolexRemovePlainLexicalization",
    ontolexRemoveReifiedLexicalization = "ontolexRemoveReifiedLexicalization",
    ontolexRemoveSubterm = "ontolexRemoveSubterm",
    ontolexSetLexicalEntryConstituent = "ontolexSetLexicalEntryConstituent",
    //Plugins
    pluginsGetPlugins = "pluginsGetPlugins", //valid for getAvailablePlugins and getPluginConfiguration
    //Properties
    propertiesAddDisjointProperty = "propertiesAddDisjointProperty",
    propertiesAddEquivalentProperty = "propertiesAddEquivalentProperty",
    propertiesAddPropertyChainAxiom = "propertiesAddPropertyChainAxiom",
    propertiesAddPropertyDomain = "propertiesAddPropertyDomain",
    propertiesAddPropertyRange = "propertiesAddPropertyRange",
    propertiesAddSuperProperty = "propertiesAddSuperProperty",
    propertiesCreateProperty = "propertiesCreateProperty",
    propertiesCreateSubProperty = "propertiesCreateSubProperty",
    propertiesDeleteProperty = "propertiesDeleteProperty",
    propertiesGetDomain = "propertiesGetDomain",
    propertiesGetPropertyTaxonomy = "propertiesGetPropertyTaxonomy", //valid for getTopProperties and getSubProperties
    propertiesGetRange = "propertiesGetRange",
    propertiesRead = "propertiesRead", //generic read actions for properties
    propertiesReadPropertyChainAxiom = "propertiesReadPropertyChainAxiom",
    propertiesRemoveDisjointProperty = "propertiesRemoveDisjointProperty",
    propertiesRemoveEquivalentProperty = "propertiesRemoveEquivalentProperty",
    propertiesRemovePropertyChainAxiom = "propertiesRemovePropertyChainAxiom",
    propertiesRemovePropertyDomain = "propertiesRemovePropertyDomain",
    propertiesRemovePropertyRange = "propertiesRemovePropertyRange",
    propertiesRemoveSuperProperty = "propertiesRemoveSuperProperty",
    propertiesUpdatePropertyChainAxiom = "propertiesUpdatePropertyChainAxiom",
    //Refactor
    refactorChangeResourceUri = "refactorChangeResourceUri",
    refactorMigrateToBaseUriGraph = "refactorMigrateToBaseUriGraph",
    refactorMoveXLabelToResource = "refactorMoveXLabelToResource",
    refactorReplaceBaseUri = "refactorReplaceBaseUri",
    refactorSkosxlToSkos = "refactorSkosxlToSkos",
    refactorSkosToSkosxl = "refactorSkosToSkosxl",
    refactorSpawnNewConceptFromLabel = "refactorSpawnNewConceptFromLabel",
    //Resources
    resourcesAddValue = "resourcesAddValue",
    resourcesRead = "resourcesRead", //represents a generic action for read
    resourcesReadLexicalizations = "resourcesReadLexicalizations", //represents a generic action for read the lexicalization of all the role
    resourcesRemoveValue = "resourcesRemoveValue",
    resourcesRemovePredicateObject = "resourcesRemovePredicateObject",
    resourcesSetDeprecated = "resourcesSetDeprecated",
    resourcesUpdateTriple = "resourcesUpdateTriple",
    resourcesUpdatePredicateObject = "resourcesUpdatePredicateObject",
    //Shacl
    shaclClearShapes = "shaclClearShapes",
    shaclExportShapes = "shaclExportShapes",
    shaclLoadShapes = "shaclLoadShapes",
    //Sheet2Rdf
    sheet2Rdf = "sheet2Rdf", //generic
    //Skos
    skosAddBroaderConcept = "skosAddBroaderConcept",
    skosAddConceptToScheme = "skosAddConceptToScheme",
    skosAddLexicalization = "skosAddLexicalization",
    skosAddMultipleToScheme = "skosAddMultipleToScheme",
    skosAddToCollection = "skosAddToCollection",
    skosAddTopConcept = "skosAddTopConcept",
    skosCreateCollection = "skosCreateCollection",
    skosCreateSubCollection = "skosCreateSubCollection",
    skosCreateNarrowerConcept = "skosCreateNarrowerConcept",
    skosCreateScheme = "skosCreateScheme",
    skosCreateTopConcept = "skosCreateTopConcept",
    skosDeleteCollection = "skosDeleteCollection",
    skosDeleteConcept = "skosDeleteConcept",
    skosDeleteScheme = "skosDeleteScheme",
    skosGetCollectionTaxonomy = "skosGetCollectionTaxonomy",
    skosGetConceptTaxonomy = "skosGetConceptTaxonomy",
    skosGetSchemes = "skosGetSchemes",
    skosReadSchemes = "skosReadSchemes",
    skosRemoveBroaderConcept = "skosRemoveBroaderConcept",
    skosRemoveConceptFromScheme = "skosRemoveConceptFromScheme",
    skosRemoveFromCollection = "skosRemoveFromCollection",
    skosRemoveLexicalization = "skosRemoveLexicalization",
    skosRemoveTopConcept = "skosRemoveTopConcept",
    //Sparql
    sparqlEvaluateQuery = "sparqlEvaluateQuery",
    sparqlExecuteUpdate = "sparqlExecuteUpdate",
    //Validation
    validation = "validation", //generic
    //Versions
    versionsCreateVersionDump = "versionsCreateVersionDump",
    versionsGetVersions = "versionsGetVersions"
}

/**
 * Define the interface of the functions
 */
export interface VBActionFunction {
    (ctx: VBActionFunctionCtx, resource?: ARTURIResource): Observable<void>
}

export class VBActionFunctions {

    private actionsFunctionMap: Map<VBActionsEnum, VBActionFunction>;

    constructor(private skosService: SkosServices, private classesService: ClassesServices, private propertyService: PropertyServices,
        private ontolexService: OntoLexLemonServices, private datatypeService: DatatypesServices, private resourceService: ResourcesServices,
        private basicModals: BasicModalServices, private creationModals: CreationModalServices) {

        this.actionsFunctionMap = new Map([
            //cls
            [ VBActionsEnum.classesCreateClass, this.classesCreateClass ],
            [ VBActionsEnum.classesCreateSubClass, this.classesCreateSubClass ],
            [ VBActionsEnum.classesDeleteClass, this.classesDeleteClass ],
            //concept
            [ VBActionsEnum.skosCreateTopConcept, this.skosCreateTopConcept ],
            [ VBActionsEnum.skosCreateNarrowerConcept, this.skosCreateNarrowerConcept ],
            [ VBActionsEnum.skosDeleteConcept, this.skosDeleteConcept ],
            //conceptScheme
            [ VBActionsEnum.skosCreateScheme, this.skosCreateScheme ],
            [ VBActionsEnum.skosDeleteScheme, this.skosDeleteScheme ],
            //dataRange
            [ VBActionsEnum.datatypesCreateDatatype, this.datatypesCreateDatatype ],
            [ VBActionsEnum.datatypesDeleteDatatype, this.datatypesDeleteDatatype ],
            //individual
            [ VBActionsEnum.classesCreateIndividual, this.classesCreateIndividual ],
            [ VBActionsEnum.classesDeleteIndividual, this.classesDeleteIndividual ],
            //limeLexicon
            [ VBActionsEnum.ontolexCreateLexicon, this.ontolexCreateLexicon ],
            [ VBActionsEnum.ontolexDeleteLexicon, this.ontolexDeleteLexicon ],
            //ontolexLexicalEntry
            [ VBActionsEnum.ontolexCreateLexicalEntry, this.ontolexCreateLexicalEntry ],
            [ VBActionsEnum.ontolexDeleteLexicalEntry, this.ontolexDeleteLexicalEntry ],
            //property
            [ VBActionsEnum.propertiesCreateProperty, this.propertiesCreateProperty ],
            [ VBActionsEnum.propertiesCreateSubProperty, this.propertiesCreateSubProperty ],
            [ VBActionsEnum.propertiesDeleteProperty, this.propertiesDeleteProperty ],
            //skosCollection
            [ VBActionsEnum.skosCreateCollection, this.skosCreateCollection ],
            [ VBActionsEnum.skosCreateSubCollection, this.skosCreateSubCollection ],
            [ VBActionsEnum.skosDeleteCollection, this.skosDeleteCollection ],
            //commons
            [ VBActionsEnum.resourcesSetDeprecated, this.resourcesSetDeprecated ]
        ]);
    }

    public getFunction(actionId: VBActionsEnum): VBActionFunction {
        return this.actionsFunctionMap.get(actionId);
    }

    /**
     * Classes
     */

    private classesCreateClass = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceCf("Create a new class", ctx.metaClass).then(
                (data: any) => {
                    let superClass: ARTURIResource = OWL.thing;
                    if (data.cls.getURI() == RDFS.class.getURI()) {
                        superClass = RDFS.resource;
                    }
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.classesService.createClass(data.uriResource, superClass, data.cls, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        }
                    );
                },
                () => { observer.error(null) }
            );
        });
    }

    private classesCreateSubClass = (ctx: VBActionFunctionCtx, parent: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceCf("Create a subClass of " + parent.getShow(), ctx.metaClass).then(
                (data: any) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.classesService.createClass(data.uriResource, parent, data.cls, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        }
                    );
                },
                () => { observer.error(null) }
            );
        });
    }

    private classesDeleteClass = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);;
            this.classesService.deleteClass(deletingResource).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                    observer.next(null);
                }
            );
        });
    }

    /**
     * Concepts
     */

    private skosCreateTopConcept = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newConceptCf("Create new skos:Concept", null, ctx.schemes, ctx.metaClass, true).then(
                (data: NewConceptCfModalReturnData) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.skosService.createConcept(data.label, data.schemes, data.uriResource, null, data.cls, null, data.cfValue).subscribe(
                        stResp => { 
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        },
                        (err: Error) => {
                            if (err.name.endsWith('PrefAltLabelClashException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                                        this.skosService.createConcept(data.label, data.schemes, data.uriResource, null, data.cls, null, data.cfValue, false).subscribe(
                                            stResp => {
                                                UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                                                observer.next(null);
                                            }
                                        );
                                    },
                                    reject => {
                                        observer.error(null);
                                    }
                                );
                            } else if (err.name.endsWith('BlacklistForbiddendException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                                        HttpServiceContext.setContextForce(true);
                                        this.skosService.createConcept(data.label, data.schemes, data.uriResource, null, data.cls, null, data.cfValue).subscribe(
                                            stResp => {
                                                UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                                                HttpServiceContext.setContextForce(false);
                                                observer.next(null);
                                            }
                                        );
                                    },
                                    reject => {
                                        observer.error(null);
                                    }
                                )
                            }
                        }
                    );
                },
                () => {
                    observer.error(null);
                }
            );
        });
    }

    private skosCreateNarrowerConcept = (ctx: VBActionFunctionCtx, parent: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newConceptCf("Create a skos:narrower", parent, null, ctx.metaClass, true).then(
                (data: NewConceptCfModalReturnData) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.skosService.createConcept(data.label, data.schemes, data.uriResource, parent, data.cls, data.broaderProp, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        },
                        (err: Error) => {
                            if (err.name.endsWith('PrefAltLabelClashException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                                        this.skosService.createConcept(data.label, data.schemes, data.uriResource, parent, data.cls, data.broaderProp, data.cfValue, false).subscribe(
                                            stResp => {
                                                UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                                                observer.next(null);
                                            }
                                        );
                                    },
                                    reject => { observer.error(null); }
                                )
                            }
                        }
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }

    private skosDeleteConcept = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
            this.skosService.deleteConcept(deletingResource).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                    observer.next(null);
                }
            );
        });
    }

    /**
     * ConceptScheme
     */

    private skosCreateScheme = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceWithLiteralCf("Create new " + ctx.metaClass.getShow(), ctx.metaClass, true).then(
                (data: NewResourceWithLiteralCfModalReturnData) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.skosService.createConceptScheme(data.literal, data.uriResource, data.cls, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        },
                        (err: Error) => {
                            if (err.name.endsWith('PrefAltLabelClashException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                                        this.skosService.createConceptScheme(data.literal, data.uriResource, data.cls, data.cfValue, false).subscribe(
                                            stResp => {
                                                UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                                                observer.next(null);
                                            },
                                        );
                                    },
                                    cancel => { observer.error(null); }
                                );
                            }
                        }
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }

    private skosDeleteScheme = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            this.skosService.isSchemeEmpty(deletingResource).subscribe(
                empty => {
                    if (empty) {
                        UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                        this.skosService.deleteConceptScheme(deletingResource).subscribe(
                            stResp => {
                                UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                                observer.next(null);
                            },
                        );
                    } else {
                        this.basicModals.confirm("Delete scheme", "The scheme is not empty. Deleting it will produce dangling concepts."
                            + " Are you sure to continue?", "warning").then(
                            confirm => {
                                UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                                this.skosService.deleteConceptScheme(deletingResource).subscribe(
                                    stResp => {
                                        UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                                        observer.next(null);
                                    },
                                );
                            },
                            cancel => { observer.error(null); }
                        );
                    }
                }
            );
        });
    }

    /**
     * dataRange
     */

    private datatypesCreateDatatype = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceCf("Create a new datatype", RDFS.datatype, false).then(
                (data: any) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.datatypeService.createDatatype(data.uriResource).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        }
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }

    private datatypesDeleteDatatype = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
            this.datatypeService.deleteDatatype(deletingResource).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                    observer.next(null);
                }
            )
        });
    }
    
    /**
     * inidividual
     */

    private classesCreateIndividual = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceCf("Create a new instance of " + ctx.metaClass.getShow(), ctx.metaClass, false).then(
                (data: any) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.classesService.createInstance(data.uriResource, ctx.metaClass, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        },
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }
    private classesDeleteIndividual = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
            this.classesService.deleteInstance(deletingResource, ctx.metaClass).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                    observer.next(null);
                }
            )
        });
    }

    /**
     * limeLexicon
     */

    private ontolexCreateLexicon = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newLexiconCf("Create new lime:Lexicon").then(
                (res: NewLexiconCfModalReturnData) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.ontolexService.createLexicon(res.language, res.uriResource, res.title, res.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        }
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }
    private ontolexDeleteLexicon = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
            this.ontolexService.deleteLexicon(deletingResource).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                    observer.next(null);
                }
            );
        });
    }

    /**
     * ontolexLexicalEntry
     */

    private ontolexCreateLexicalEntry = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceWithLiteralCf("Create new ontolex:LexicalEntry", OntoLex.lexicalEntry, true, "Canonical Form",
                ctx.lexicon.lang, { constrain: true, locale: true }).then(
                (data: NewResourceWithLiteralCfModalReturnData) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.ontolexService.createLexicalEntry(data.literal, ctx.lexicon.res, data.uriResource, data.cls, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        }
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }

    private ontolexDeleteLexicalEntry = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
            this.ontolexService.deleteLexicalEntry(deletingResource).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                    observer.next(null);
                }
            );
        });
    }


    /**
     * Property
     */

    private propertiesCreateProperty = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceCf("Create a new " + ctx.metaClass.getShow(), ctx.metaClass, false).then(
                (data: any) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.propertyService.createProperty(data.cls, data.uriResource, null, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        }
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }
    private propertiesCreateSubProperty = (ctx: VBActionFunctionCtx, parent: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceCf("Create subProperty of " + parent.getShow(), ctx.metaClass, false).then(
                (data: any) => {
                    this.propertyService.createProperty(data.cls, data.uriResource, parent, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                            observer.next(null);
                        }
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }
    private propertiesDeleteProperty = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
            this.propertyService.deleteProperty(deletingResource).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                    observer.next(null);
                }
            )
        });
    }

    /**
     * SkosCollection
     */
    private skosCreateCollection = (ctx: VBActionFunctionCtx) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceWithLiteralCf("Create new " + ctx.metaClass.getShow(), ctx.metaClass, true).then(
                (data: NewResourceWithLiteralCfModalReturnData) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                    this.skosService.createCollection(ctx.metaClass, data.literal, data.uriResource, null, data.cls, data.cfValue).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement),
                            observer.next(null);
                        },
                        (err: Error) => {
                            if (err.name.endsWith('PrefAltLabelClashException')) {
                                this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                    confirm => {
                                        this.skosService.createCollection(ctx.metaClass, data.literal, data.uriResource, null, data.cls, data.cfValue, false).subscribe(
                                            stResp => {
                                                UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement),
                                                observer.next(null);
                                            }
                                        );
                                    },
                                    cancel => { observer.error(null); }
                                );
                            }
                        }
                    );
                },
                cancel => { observer.error(null); }
            );
        });
    }

    private skosCreateSubCollection = (ctx: VBActionFunctionCtx, parent: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            this.creationModals.newResourceWithLiteralCf("Create a nested " + ctx.metaClass.getShow(), ctx.metaClass, true).then(
                (data: NewResourceWithLiteralCfModalReturnData) => {
                    UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
                        this.skosService.createCollection(ctx.metaClass, data.literal, data.uriResource, parent, data.cls, data.cfValue).subscribe(
                            stResp => {
                                UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement),
                                observer.next(null);
                            },
                            (err: Error) => {
                                if (err.name.endsWith('PrefAltLabelClashException')) {
                                    this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
                                        confirm => {
                                            this.skosService.createCollection(ctx.metaClass, data.literal, data.uriResource, parent, data.cls, data.cfValue, false).subscribe(
                                                stResp => {
                                                    UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement),
                                                    observer.next(null);
                                                }
                                            );
                                        },
                                        cancel => { observer.error(null); }
                                    );
                                }
                            }
                        );
                },
                cancel => { observer.error(null); }
            );
        });
    }

    private skosDeleteCollection = (ctx: VBActionFunctionCtx, deletingResource: ARTURIResource) => {
        return Observable.create((observer: Observer<void>) => {
            UIUtils.startLoadingDiv(ctx.loadingDivRef.nativeElement);
            if (ctx.metaClass.equals(SKOS.collection)) {
                this.skosService.deleteCollection(deletingResource).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                        observer.next(null);
                    }
                );
            } else { //ctx.metaClass.equals(SKOS.orderedCollection)
                this.skosService.deleteOrderedCollection(deletingResource).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(ctx.loadingDivRef.nativeElement);
                        observer.next(null);
                    }
                );
            }
        });
    }

    /**
     * Common
     */

    private resourcesSetDeprecated = (ctx: VBActionFunctionCtx, resource: ARTURIResource) => {
        return this.resourceService.setDeprecated(resource);
    }

}


export class VBActionFunctionCtx {
    metaClass: ARTURIResource; //class of the creating resource
    loadingDivRef: ElementRef; //reference of the loading div to show at the begin of the action and to hide at the end.
    schemes?: ARTURIResource[];
    lexicon?: {
        res: ARTURIResource;
        lang: string;
    }
}