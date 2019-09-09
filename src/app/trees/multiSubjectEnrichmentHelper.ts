import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ARTLiteral, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../models/ARTResources";
import { CustomForm, CustomFormValue } from "../models/CustomForms";
import { ResViewPartition, ResViewUtils } from "../models/ResourceView";
import { OntoLex, OWL, RDFS, SKOS, SKOSXL } from "../models/Vocabulary";
import { EnrichmentType, PropertyEnrichmentHelper, PropertyEnrichmentInfo } from "../resourceView/renderer/propertyEnrichmentHelper";
import { AddPropertyValueModalReturnData } from "../resourceView/resViewModals/addPropertyValueModal";
import { ConstituentListCreatorModalReturnData } from "../resourceView/resViewModals/constituentListCreatorModal";
import { PropertyListCreatorModalReturnData } from "../resourceView/resViewModals/propertyChainCreatorModal";
import { ResViewModalServices } from "../resourceView/resViewModals/resViewModalServices";
import { ClassesServices } from "../services/classesServices";
import { IndividualsServices } from "../services/individualsServices";
import { ManchesterServices } from "../services/manchesterServices";
import { OntoLexLemonServices } from "../services/ontoLexLemonServices";
import { PropertyServices } from "../services/propertyServices";
import { ResourcesServices } from "../services/resourcesServices";
import { SkosServices } from "../services/skosServices";
import { SkosxlServices } from "../services/skosxlServices";
import { HttpServiceContext } from "../utils/HttpManager";
import { ResourceUtils } from "../utils/ResourceUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";
import { NewOntoLexicalizationCfModalReturnData } from "../widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal";
import { NewResourceWithLiteralCfModalReturnData } from "../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal";
import { NewXLabelModalReturnData } from "../widget/modal/creationModal/newResourceModal/skos/newXLabelModal";

@Injectable()
export class MultiSubjectEnrichmentHelper {

    private partitionPropertiesMap: { partition:ResViewPartition, handledProperties: ARTURIResource[] }[] = [];
    
    constructor(private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices, 
        private resViewModals: ResViewModalServices, private creationModals: CreationModalServices,
        private clsService: ClassesServices, private individualService: IndividualsServices, private manchService: ManchesterServices, 
        private ontolexService: OntoLexLemonServices, private propService: PropertyServices, private resourcesService: ResourcesServices, 
        private skosService: SkosServices, private skosxlService: SkosxlServices,
        private eventHandler: VBEventHandler
    ) {
        ResViewUtils.orderedResourceViewPartitions.forEach(p => {
            let properties: ARTURIResource[] = ResViewUtils.getPartitionKnownProperties(p);
            /**
             * special case:
             * In the ResourceView, the lexicalizations partition has no known properties since they're retrieved at runtime
             * according the lexicalization model. Here add them manually just to know that they can be handled
             */
            if (p == ResViewPartition.lexicalizations) {
                properties = [RDFS.label, SKOS.prefLabel, SKOS.altLabel, SKOS.hiddenLabel, SKOSXL.prefLabel, SKOSXL.altLabel, SKOSXL.hiddenLabel, OntoLex.isDenotedBy];
            }
            this.partitionPropertiesMap.push({
                partition: p,
                handledProperties: properties
            });
        })
    }

    enrichMultiSubject(resources: ARTURIResource[]) {
        //filter the not explicit resources since they cannot be changed
        let subjects: ARTURIResource[] = [];
        let excludedSubject: ARTURIResource[] = [];
        resources.forEach(r => {
            if (r.getAdditionalProperty(ResAttribute.EXPLICIT)) {
                subjects.push(r);
            } else {
                excludedSubject.push(r);
            }
        });
        
        if (subjects.length == 0) {
            this.basicModals.alert("Multivalue addition", "All the selected resources are not explicit, so they cannot be edited", "warning");
            return;
        } else if (excludedSubject.length > 0) {
            this.basicModals.alert("Multivalue addition", 
                "Some of the selected resources are not explicit, they cannot be edited, so they will be not affected by the changes:\n" + 
                excludedSubject.map(s => " - " + s.getShow()).join("\n"), "warning").then(
                resp => {
                    this.selectProperty(subjects);
                }
            );
        } else { //all resources are explicit
            this.selectProperty(subjects);
        }
    }

    private selectProperty(subjects: ARTURIResource[]) {
        this.browsingModals.browsePropertyTree("Select a property", null, subjects[0]).then(
            (selectedProp: ARTURIResource) => {
                /**
                 * Here plartially replicate the behaviour of the ResourceView partitions.
                 * Invoke a different handler according the enriching property
                 */
                let handlingPartition: ResViewPartition;
                this.partitionPropertiesMap.forEach(entry => {
                    if (ResourceUtils.containsNode(entry.handledProperties, selectedProp)) {
                        handlingPartition = entry.partition;
                    }
                });
                //handle the property according the partition 
                switch (handlingPartition) {
                    case ResViewPartition.broaders:
                        return this.broaderHandler(subjects, selectedProp);
                    case ResViewPartition.classaxioms:
                        return this.classAxiomsHandler(subjects, selectedProp);
                    case ResViewPartition.constituents: 
                        return this.constituentsHandler(subjects, selectedProp);
                    case ResViewPartition.denotations: 
                        return this.denotationsHandler(subjects, selectedProp);
                    case ResViewPartition.disjointProperties: 
                        return this.disjointPropertiesHandler(subjects, selectedProp);
                    case ResViewPartition.domains: 
                        return this.domainsPropertiesHandler(subjects, selectedProp);
                    case ResViewPartition.equivalentProperties: 
                        return this.equivalentPropertiesHandler(subjects, selectedProp);
                    case ResViewPartition.evokedLexicalConcepts: 
                        return this.evokedLexicalConceptsHandler(subjects, selectedProp);
                    case ResViewPartition.facets: 
                        return null;
                    case ResViewPartition.formRepresentations: 
                        /**
                         * this partition is available only for lexical forms that are not visible in a dedicated treePanel,
                         * so it should not be possible to handle in a dedicated way for multiple lexical form
                         */
                        return this.otherPropertiesHandler(subjects, selectedProp);
                    case ResViewPartition.imports: 
                        return this.unavailableOperation(selectedProp);
                    case ResViewPartition.labelRelations: 
                        return this.labelRelationsHandler(subjects, selectedProp);
                    case ResViewPartition.lexicalForms: 
                        return this.lexicalFormsHandler(subjects, selectedProp);
                    case ResViewPartition.lexicalSenses: 
                        return this.lexicalSensesHandler(subjects, selectedProp);
                    case ResViewPartition.lexicalizations: 
                        return this.lexicalizationsHandler(subjects, selectedProp);
                    case ResViewPartition.members: 
                        return this.membersHandler(subjects, selectedProp);
                    case ResViewPartition.notes: 
                        return this.notesHandler(subjects, selectedProp);
                    case ResViewPartition.ranges: 
                        return this.rangesHandler(subjects, selectedProp);;
                    case ResViewPartition.schemes: 
                        return this.schemesHandler(subjects, selectedProp);;
                    case ResViewPartition.subPropertyChains: 
                        return this.subPropertyChainsHandler(subjects, selectedProp);;
                    case ResViewPartition.subterms: 
                        return this.subtermsHandler(subjects, selectedProp);;
                    case ResViewPartition.superproperties: 
                        return this.superpropertiesHandler(subjects, selectedProp);;
                    case ResViewPartition.topconceptof: 
                        return this.topconceptofHandler(subjects, selectedProp);;
                    case ResViewPartition.types: 
                        return this.typesHandler(subjects, selectedProp);;
                    default:
                        return this.otherPropertiesHandler(subjects, selectedProp);
                }
            },
            () => { }
        );
    }

    /**
     * =============== HANDLERS ===============
     * In the following handler, often it is called addPropertyValue().
     * Of this method, the 2nd parameter is the subject resource that is going to be enriched. It is used just to do some checks with its role.
     * Since here all the resources in the subjects array have the same role, it is safety to provide just the first element.
     * Moreover, since the property has been already chosen, set propChangeable (4th param) to false.
     * Finally, disable the multiselection of the target values (5th param).
     */

    private broaderHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a broader", subjects[0], predicate, false, null, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let value: ARTURIResource = data.value[0]; //multiselection has been disallowed in addPropertyValue => it's safety to get only the 1st value
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.skosService.addBroaderConcept(s, value),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        );
    }

    private classAxiomsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        if (predicate.getURI() == OWL.oneOf.getURI()) {
            this.resViewModals.createInstanceList("Add " + predicate.getShow()).then(
                (instances: ARTURIResource[]) => {
                    let addFunctions: MultiSubjectAddFunction[] = [];
                    subjects.forEach((s: ARTURIResource) => {
                        addFunctions.push({
                            function: this.clsService.addOneOf(s, instances),
                            subject: s
                        });
                    });
                    this.addMultiple(addFunctions);
                },
                () => { }
            );
        } else if (predicate.getURI() == OWL.intersectionOf.getURI() || predicate.getURI() == OWL.unionOf.getURI()) {
            this.resViewModals.createClassList("Add " + predicate.getShow()).then(
                (classes: ARTURIResource[]) => {
                    let addFunctions: MultiSubjectAddFunction[] = [];
                    if (predicate.getURI() == OWL.intersectionOf.getURI()) {
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.clsService.addIntersectionOf(s, classes),
                                subject: s
                            });
                        });
                    } else if (predicate.getURI() == OWL.unionOf.getURI()) {
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.clsService.addUnionOf(s, classes),
                                subject: s
                            });
                        });
                    }
                    this.addMultiple(addFunctions);
                },
                () => { }
            );
        } else { //rdfs:subClassOf, owl:equivalentClass, owl:disjointWith, owl:complementOf
            //ask the user to choose to add an existing class or to add a class expression
            this.resViewModals.addPropertyValue("Add " + predicate.getShow(), subjects[0], predicate, false, null, false).then(
                (data: AddPropertyValueModalReturnData) => {
                    let addFunctions: MultiSubjectAddFunction[] = [];
                    var value: any = data.value; //value can be a class or a manchester Expression
                    if (typeof value == "string") {
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.manchService.createRestriction(s, predicate, value),
                                subject: s
                            });
                        });
                    } else { //value is an ARTURIResource[] (class(es) selected from the tree)
                        let value: ARTURIResource = data.value[0]; //multivalue disallowed => get the first
                        if (predicate.getURI() == RDFS.subClassOf.getURI()) {
                            subjects.forEach((s: ARTURIResource) => {
                                addFunctions.push({
                                    function: this.clsService.addSuperCls(s, value),
                                    subject: s
                                });
                            });
                        } else {
                            subjects.forEach((s: ARTURIResource) => {
                                addFunctions.push({
                                    function: this.resourcesService.addValue(s, predicate, value),
                                    subject: s
                                });
                            });
                        }
                    }
                    this.addMultiple(addFunctions);
                },
                () => { }
            );
        }
    }

    private constituentsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.createConstituentList("Create a constituents list").then(
            (data: ConstituentListCreatorModalReturnData) => {
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.ontolexService.setLexicalEntryConstituents(s, data.list, data.ordered),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        );
    }

    private denotationsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.creationModals.newOntoLexicalizationCf("Add a denotation", predicate, false).then(
            (data: NewOntoLexicalizationCfModalReturnData) => {
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.ontolexService.addLexicalization(s, data.linkedResource, data.createPlain, data.createSense, data.cls, data.cfValue),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        );
    }

    private disjointPropertiesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a disjoint property", subjects[0], predicate, false, null, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let inverse: boolean = data.inverseProperty;
                let value: ARTURIResource = data.value[0];
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.propService.addPropertyDisjointWith(s, value, predicate, inverse),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        )
    }

    private domainsPropertiesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a domain", subjects[0], predicate, false, null, false).then(
            (data: any) => {
                let addFunctions: MultiSubjectAddFunction[] = [];
                let value: any = data.value; //value can be class(es) or a manchester Expression
                if (typeof value == "string") {
                    subjects.forEach((s: ARTURIResource) => {
                        addFunctions.push({
                            function: this.manchService.createRestriction(s, predicate, value),
                            subject: s
                        });
                    });
                } else { //value is ARTURIResource[] (class(es) selected from the tree)
                    subjects.forEach((s: ARTURIResource) => {
                        addFunctions.push({
                            function: this.propService.addPropertyDomain(s, value),
                            subject: s
                        });
                    });
                }
                this.addMultiple(addFunctions);
            },
            () => {}
        )
    }

    private equivalentPropertiesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add an equivalent property", subjects[0], predicate, false, null, false).then(
            (data: any) => {
                let inverse: boolean = data.inverseProperty;
                let value: ARTURIResource = data.value[0];

                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.propService.addEquivalentProperty(s, value, predicate, inverse),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        )
    }

    private evokedLexicalConceptsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.otherPropertiesHandler(subjects, predicate);
    }
    
    private labelRelationsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add " + predicate.getShow(), subjects[0], predicate, false, null, false).then(
            (data: any) => {
                let value: ARTURIResource = data.value[0];
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(s, predicate, value),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        );
    }

    private lexicalFormsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        //multiple subjects (lexical entry) have the same language, so it is safe to get the form language of the first one
        this.ontolexService.getLexicalEntryLanguage(subjects[0]).subscribe(
            lang => {
                this.creationModals.newResourceWithLiteralCf("Create " + predicate.getShow(), OntoLex.form, true, "Written rep", lang, { constrain: true, locale: true }).then(
                    (data: NewResourceWithLiteralCfModalReturnData) => {
                        let addFunctions: MultiSubjectAddFunction[] = [];
                        if (predicate.getURI() == OntoLex.canonicalForm.getURI()) {
                            subjects.forEach((s: ARTURIResource) => {
                                addFunctions.push({
                                    function: this.ontolexService.setCanonicalForm(s, data.literal, data.uriResource, data.cfValue),
                                    subject: s
                                });
                            });
                        } else if (predicate.getURI() == OntoLex.otherForm.getURI()) {
                            subjects.forEach((s: ARTURIResource) => {
                                addFunctions.push({
                                    function: this.ontolexService.addOtherForm(s, data.literal, data.uriResource, data.cfValue),
                                    subject: s
                                });
                            });
                        }
                        this.addMultiple(addFunctions);
                    },
                    () => {}
                );
            }
        );
    }

    private lexicalSensesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.creationModals.newOntoLexicalizationCf("Add a lexical sense", predicate, false).then(
            (data: NewOntoLexicalizationCfModalReturnData) => {
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.ontolexService.addLexicalization(s, data.linkedResource, data.createPlain, data.createSense, data.cls, data.cfValue),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        )
    }

    private lexicalizationsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        if (predicate.equals(SKOS.prefLabel) || predicate.equals(SKOSXL.prefLabel)) {
            this.basicModals.alert("Add " + predicate.getShow(), "This operation is not allowed for the selected property. " + 
                "Multiple resources cannot have the same " + predicate.getShow() + ".", "warning");
            return;
        }
        if (predicate.getBaseURI() == SKOSXL.namespace) { //SKOSXL
            this.creationModals.newXLabel("Add " + predicate.getShow()).then(
                (data: NewXLabelModalReturnData) => {
                    let addFunctions: MultiSubjectAddFunction[] = [];
                    if (predicate.equals(SKOSXL.altLabel)) {
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.skosxlService.addAltLabel(s, data.labels[0], data.cls),
                                subject: s
                            });
                        });
                    } else if (predicate.equals(SKOSXL.hiddenLabel)) {
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.skosxlService.addHiddenLabel(s, data.labels[0], data.cls),
                                subject: s
                            });
                        });
                    }
                    this.addMultiple(addFunctions);
                },
                () => {}
            );
        } else if (predicate.getBaseURI() == SKOS.namespace) {
            this.creationModals.newPlainLiteral("Add " + predicate.getShow()).then(
                (labels: ARTLiteral[]) => {
                    let addFunctions: MultiSubjectAddFunction[] = [];
                    if (predicate.equals(SKOS.altLabel)) {
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.skosService.addAltLabel(s, labels[0]),
                                subject: s
                            });
                        });
                    } else if (predicate.equals(SKOS.hiddenLabel)) {
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.skosService.addHiddenLabel(s, labels[0]),
                                subject: s
                            });
                        });
                    }
                    this.addMultiple(addFunctions);
                },
                () => { }
            );
        } else if (predicate.equals(RDFS.label)) {
            this.creationModals.newPlainLiteral("Add " + predicate.getShow()).then(
                (labels: ARTLiteral[]) => {
                    let addFunctions: MultiSubjectAddFunction[] = [];
                    subjects.forEach((s: ARTURIResource) => {
                        addFunctions.push({
                            function: this.resourcesService.addValue(s, predicate, labels[0]),
                            subject: s
                        });
                    });
                    this.addMultiple(addFunctions);
                }
            );
        } else if (predicate.equals(OntoLex.isDenotedBy)) {
            this.creationModals.newOntoLexicalizationCf("Add a lexical sense", predicate, false).then(
                (data: NewOntoLexicalizationCfModalReturnData) => {
                    let addFunctions: MultiSubjectAddFunction[] = [];
                    subjects.forEach((s: ARTURIResource) => {
                        addFunctions.push({
                            function: this.ontolexService.addLexicalization(data.linkedResource, s, data.createPlain, data.createSense, data.cls, data.cfValue),
                            subject: s
                        });
                    });
                    this.addMultiple(addFunctions);
                },
                () => {}
            )
        }
    }

    private membersHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", subjects[0], predicate, false, null, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let value: ARTURIResource = data.value[0];
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.skosService.addToCollection(s, value),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            }
        );
    }

    private notesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.otherPropertiesHandler(subjects, predicate);
    }

    private rangesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        //check if all the properties are of the same type
        for (let i = 0; i < subjects.length; i++) {
            if (subjects[i].getRole() != subjects[0].getRole()) {
                this.basicModals.alert("Add range", "The addition of the same range to multiple properties is not allowed on properties of different types", "warning");
                return;
            }
        }
        this.resViewModals.addPropertyValue("Add a range", subjects[0], predicate, false, null, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let value: any = data.value; //value can be a class, manchester Expression, or a datatype (if resource is a datatype prop)
                /** If the rerource is a datatype property, value could be a:
                 * - datatype (ARTURIResource[])
                 * - datarange (ARTLiteral[])
                 */
                if (subjects[0].getRole() == RDFResourceRolesEnum.datatypeProperty) { //given the check at the begin of this method, here it is safety to do the check on the 1st element
                    if (value instanceof Array) {
                        let addFunctions: MultiSubjectAddFunction[] = [];
                        if (value[0] instanceof ARTLiteral) { //datarange
                            subjects.forEach((s: ARTURIResource) => {
                                addFunctions.push({
                                    function: this.propService.setDataRange(s, value),
                                    subject: s
                                });
                            })
                        } else { //instance of ARTURIResource => datatype (multiselection disabled, so take the 1st one)
                            subjects.forEach((s: ARTURIResource) => {
                                addFunctions.push({
                                    function: this.propService.addPropertyRange(s, value[0]),
                                    subject: s
                                });
                            })
                        }
                        this.addMultiple(addFunctions);
                    }
                }
                /** Otherwise, if the resource is a object/annotation/ontologyProperty, value could be a:
                 * - resource
                 * - manchester expression
                 */
                else {
                    let addFunctions: MultiSubjectAddFunction[] = [];
                    if (typeof value == "string") {
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.manchService.createRestriction(s, predicate, value),
                                subject: s
                            });
                        })
                    } else { //value is a ARTURIResource[] (classes selected from the tree)
                        subjects.forEach((s: ARTURIResource) => {
                            addFunctions.push({
                                function: this.propService.addPropertyRange(s, value[0]),
                                subject: s
                            });
                        })
                    }
                    this.addMultiple(addFunctions);
                }
            },
            () => { }
        )
    }

    private schemesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add Concept to a Scheme", subjects[0], predicate, false, null, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let value: ARTURIResource = data.value[0];

                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.skosService.addConceptToScheme(s, value),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        )
    }

    private subPropertyChainsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.createPropertyChain("Create a property chain", predicate, false).then(
            (data: PropertyListCreatorModalReturnData) => {
                let chain: string[] = data.chain;
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.propService.addPropertyChainAxiom(s, chain.join(","), predicate),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        );

    }

    private subtermsHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.browsingModals.browseLexicalEntryList("Add a subterm", null, true, true, false, false).then(
            (value: ARTURIResource) => {
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.ontolexService.addSubterm(s, value, predicate),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        );
    }

    private superpropertiesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a superproperty", subjects[0], predicate, false, null, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let inverse: boolean = data.inverseProperty;
                let value: ARTURIResource = data.value[0];
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.propService.addSuperProperty(s, value, predicate, inverse),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    private topconceptofHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Set as top Concept of", subjects[0], predicate, false, null, false).then(
            (data: any) => {
                let value: ARTURIResource = data.value[0];
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.skosService.addTopConcept(s, value),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        );
    }

    private typesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a type", subjects[0], predicate, false, null, false).then(
            (data: any) => {
                let value: ARTURIResource = data.value[0];
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.individualService.addType(s, value),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => {}
        );

    }

    private otherPropertiesHandler(subjects: ARTURIResource[], predicate: ARTURIResource) {
        PropertyEnrichmentHelper.getPropertyEnrichmentInfo(predicate, this.propService, this.basicModals).subscribe(
            (data: PropertyEnrichmentInfo) => {
                if (data.type == EnrichmentType.resource) {
                    this.enrichWithResource(subjects, predicate);
                } else if (data.type == EnrichmentType.plainLiteral) {
                    this.enrichWithPlainLiteral(subjects, predicate);
                } else if (data.type == EnrichmentType.typedLiteral) {
                    this.enrichWithTypedLiteral(subjects, predicate, data.allowedDatatypes, data.dataRanges);
                } else if (data.type == EnrichmentType.customForm) {
                    this.enrichWithCustomForm(subjects, predicate, data.form);
                }
            }
        );
    }

    private unavailableOperation(predicate: ARTURIResource) {
        this.basicModals.alert("Unavailable operation", "Cannot enrich multiple subject with the same property-value for the predicate " + predicate.getShow());
    }


    /**
     * HANDLERS FOR DIFFERENT TYPES OF VALUES
     * these method are invoked by the generic otherPropertiesHandler according the required type of value 
     */

    private enrichWithCustomForm(subjects: ARTURIResource[], predicate: ARTURIResource, form: CustomForm) {
        this.resViewModals.enrichCustomForm("Add " + predicate.getShow(), form.getId()).then(
            (entryMap: any) => {
                let cfValue: CustomFormValue = new CustomFormValue(form.getId(), entryMap);
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(s, predicate, cfValue),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        )
    }

    private enrichWithPlainLiteral(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.creationModals.newPlainLiteral("Add " + predicate.getShow()).then(
            (literals: ARTLiteral[]) => {
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(s, predicate, literals[0]),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    private enrichWithTypedLiteral(subjects: ARTURIResource[], predicate: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[]) {
        this.creationModals.newTypedLiteral("Add " + predicate.getShow(), predicate, allowedDatatypes, dataRanges, true).then(
            (literals: ARTLiteral[]) => {
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(s, predicate, literals[0]),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    private enrichWithResource(subjects: ARTURIResource[], predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add " + predicate.getShow(), subjects[0], predicate, false, null, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let value: ARTURIResource = data.value[0];
                let addFunctions: MultiSubjectAddFunction[] = [];
                subjects.forEach((s: ARTURIResource) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(s, predicate, value),
                        subject: s
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        )
    }

    /**
     * =============== MULTIADDITION AND ERROR HANDLER ===============
     */


    private addMultiple(addFunctions: MultiSubjectAddFunction[], errorHandler?: (errors: MultiSubjectAddError[]) => void, errors?: MultiSubjectAddError[]) {
        if (errors == null) errors = [];

        HttpServiceContext.disableErrorInterception(); //temporarly disable the error interceptor

        if (addFunctions.length == 0) { //no more function to call
            //handle the errors, if any, if an handler is defined
            if (errors.length > 0) {
                if (errorHandler != null) {
                    errorHandler(errors);
                } else {
                    if (errors.length == 1) {
                        this.handleSingleMultiAddError(errors[0]);
                    } else {
                        this.handleMultipleMultiAddError(errors);
                    }
                }
            }
            HttpServiceContext.enableErrorInterception(); //re-enable the error interceptor
        } else {
            addFunctions[0].function.subscribe(
                stResp => {
                    this.eventHandler.resourceUpdatedEvent.emit(addFunctions[0].subject); //emit event for updating the ResView of the edited subject
                    addFunctions.shift(); //remove the first function (the one just called) and call itself recursively
                    this.addMultiple(addFunctions, errorHandler, errors);
                },
                err => {
                    errors.push({ subject: addFunctions[0].subject, error: err }); //collect the value and the error catched
                    addFunctions.shift(); //remove the first function (the one just called) and call itself recursively
                    this.addMultiple(addFunctions, errorHandler, errors);
                }
            );
        }
    }

    private handleSingleMultiAddError(error: MultiSubjectAddError) {
        let message = "The addition for the subject " + error.subject.toNT() + " has failed due to the following reason:\n" +  error.error.name + 
                ((error.error.message != null) ? ":\n" + error.error.message : "");
        let details = error.error.stack;
        this.basicModals.alert("Error", message, "error", details);
    }
    private handleMultipleMultiAddError(errors: MultiSubjectAddError[]) {
        let message = "The addition for the following subject have failed:"
        errors.forEach((e: MultiSubjectAddError) => {
            message += "\n\n" + e.subject.toNT() + "\nReason:\n" + e.error.name + ((e.error.message != null) ? ":\n" + e.error.message : "");
        });
        this.basicModals.alert("Error", message, "error");
    }

}


class MultiSubjectAddFunction {
    function: Observable<any>;
    subject: ARTURIResource;
}

export class MultiSubjectAddError { 
    subject: ARTURIResource;
    error: Error;
}