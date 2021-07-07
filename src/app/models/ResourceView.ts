import { ARTURIResource } from "./ARTResources";
import { VersionInfo } from "./History";
import { Decomp, OntoLex, OWL, RDF, RDFS, SKOS, SKOSXL } from "./Vocabulary";

export enum ResViewPartition {
    broaders = "broaders",
    classaxioms = "classaxioms",
    constituents = "constituents",
    datatypeDefinitions = "datatypeDefinitions",
    denotations = "denotations",
    disjointProperties = "disjointProperties",
    domains = "domains",
    equivalentProperties = "equivalentProperties",
    evokedLexicalConcepts = "evokedLexicalConcepts",
    facets = "facets",
    formBasedPreview = "formBasedPreview",
    formRepresentations = "formRepresentations",
    imports = "imports",
    labelRelations = "labelRelations",
    lexicalizations = "lexicalizations",
    lexicalForms = "lexicalForms",
    lexicalSenses = "lexicalSenses",
    members = "members",
    membersOrdered = "membersOrdered",
    notes = "notes",
    properties = "properties",
    ranges = "ranges",
    rdfsMembers = "rdfsMembers",
    schemes = "schemes",
    subPropertyChains = "subPropertyChains",
    subterms = "subterms",
    superproperties = "superproperties",
    topconceptof = "topconceptof",
    types = "types"
}

export class ResViewUtils {

    /**
     * partitions where add manually functionality is enabled.
     * Note: if a partition is added, remember to change the implementation of checkTypeCompliantForManualAdd in the renderer.
     */
    public static addManuallyPartition: ResViewPartition[] = [
        ResViewPartition.broaders,
        ResViewPartition.classaxioms,
        ResViewPartition.constituents,
        ResViewPartition.disjointProperties,
        ResViewPartition.domains,
        ResViewPartition.equivalentProperties,
        ResViewPartition.facets,
        ResViewPartition.formRepresentations,
        ResViewPartition.imports,
        ResViewPartition.labelRelations,
        ResViewPartition.members,
        ResViewPartition.notes,
        ResViewPartition.properties,
        ResViewPartition.ranges,
        ResViewPartition.rdfsMembers,
        ResViewPartition.schemes,
        ResViewPartition.subterms,
        ResViewPartition.superproperties,
        ResViewPartition.topconceptof,
        ResViewPartition.types
    ];

    /**
     * partitions where add external resource functionality is enabled.
     */
    public static addExternalResourcePartition: ResViewPartition[] = [
        ResViewPartition.broaders,
        ResViewPartition.classaxioms,
        ResViewPartition.disjointProperties,
        ResViewPartition.domains,
        ResViewPartition.equivalentProperties,
        ResViewPartition.facets,
        ResViewPartition.labelRelations,
        ResViewPartition.members,
        ResViewPartition.properties, //how to determine if range is literal?
        ResViewPartition.ranges,
        ResViewPartition.schemes,
        ResViewPartition.superproperties,
        ResViewPartition.topconceptof,
        ResViewPartition.types
    ];

    /**
     * The partitions ordered according how they are shown in the RV
     */
    public static orderedResourceViewPartitions: ResViewPartition[] = [
        ResViewPartition.types,
        ResViewPartition.classaxioms,
        ResViewPartition.topconceptof,
        ResViewPartition.schemes,
        ResViewPartition.broaders,
        ResViewPartition.superproperties,
        ResViewPartition.equivalentProperties,
        ResViewPartition.disjointProperties,
        ResViewPartition.subPropertyChains,
        ResViewPartition.subterms,
        ResViewPartition.domains,
        ResViewPartition.ranges,
        ResViewPartition.facets,
        ResViewPartition.datatypeDefinitions,
        ResViewPartition.lexicalizations,
        ResViewPartition.lexicalForms,
        ResViewPartition.lexicalSenses,
        ResViewPartition.denotations,
        ResViewPartition.evokedLexicalConcepts,
        ResViewPartition.notes,
        ResViewPartition.members,
        ResViewPartition.membersOrdered,
        ResViewPartition.labelRelations,
        ResViewPartition.formRepresentations,
        ResViewPartition.formBasedPreview,
        ResViewPartition.imports,
        ResViewPartition.constituents,
        ResViewPartition.rdfsMembers,
        ResViewPartition.properties
    ]

    public static getResourceViewPartitionLabelTranslationKey(partition: ResViewPartition): string {
        switch (partition) {
            case ResViewPartition.broaders:
                return "RESOURCE_VIEW.PARTITIONS.BROADERS";
            case ResViewPartition.classaxioms:
                return "RESOURCE_VIEW.PARTITIONS.CLASS_AXIOMS";
            case ResViewPartition.constituents:
                return "RESOURCE_VIEW.PARTITIONS.CONSTITUENTS";
            case ResViewPartition.datatypeDefinitions:
                return "RESOURCE_VIEW.PARTITIONS.DATATYPE_DEFINITIONS";
            case ResViewPartition.denotations:
                return "RESOURCE_VIEW.PARTITIONS.DENOTATIONS";
            case ResViewPartition.disjointProperties:
                return "RESOURCE_VIEW.PARTITIONS.DISJOINT_PROPERTIES";
            case ResViewPartition.domains:
                return "RESOURCE_VIEW.PARTITIONS.DOMAINS";
            case ResViewPartition.equivalentProperties:
                return "RESOURCE_VIEW.PARTITIONS.EQUIVALENT_PROPERTIES";
            case ResViewPartition.evokedLexicalConcepts:
                return "RESOURCE_VIEW.PARTITIONS.EVOKED_LEXICAL_CONCEPTS";
            case ResViewPartition.facets:
                return "RESOURCE_VIEW.PARTITIONS.FACETS";
            case ResViewPartition.formBasedPreview:
                return "RESOURCE_VIEW.PARTITIONS.FORM_BASED_PREVIEW";
            case ResViewPartition.formRepresentations:
                return "RESOURCE_VIEW.PARTITIONS.FORM_PRESENTATIONS";
            case ResViewPartition.imports:
                return "RESOURCE_VIEW.PARTITIONS.IMPORTS";
            case ResViewPartition.labelRelations:
                return "RESOURCE_VIEW.PARTITIONS.LABEL_RELATIONS";
            case ResViewPartition.lexicalForms:
                return "RESOURCE_VIEW.PARTITIONS.LEXICAL_FORMS";
            case ResViewPartition.lexicalSenses:
                return "RESOURCE_VIEW.PARTITIONS.LEXICAL_SENSES";
            case ResViewPartition.lexicalizations:
                return "RESOURCE_VIEW.PARTITIONS.LEXICALIZATIONS";
            case ResViewPartition.members:
                return "RESOURCE_VIEW.PARTITIONS.MEMBERS";
            case ResViewPartition.membersOrdered:
                return "RESOURCE_VIEW.PARTITIONS.MEMBERS_ORDERED";
            case ResViewPartition.notes:
                return "RESOURCE_VIEW.PARTITIONS.NOTES";
            case ResViewPartition.properties:
                return "RESOURCE_VIEW.PARTITIONS.PROPERTIES";
            case ResViewPartition.ranges:
                return "RESOURCE_VIEW.PARTITIONS.RANGES";
            case ResViewPartition.rdfsMembers:
                return "RESOURCE_VIEW.PARTITIONS.RDFS_MEMBERS";
            case ResViewPartition.schemes:
                return "RESOURCE_VIEW.PARTITIONS.SCHEMES";
            case ResViewPartition.subPropertyChains:
                return "RESOURCE_VIEW.PARTITIONS.SUBPROPERTY_CHAINS";
            case ResViewPartition.subterms:
                return "RESOURCE_VIEW.PARTITIONS.SUBTERMS";
            case ResViewPartition.superproperties:
                return "RESOURCE_VIEW.PARTITIONS.SUPERPROPERTIES";
            case ResViewPartition.topconceptof:
                return "RESOURCE_VIEW.PARTITIONS.TOP_CONCEPT_OF";
            case ResViewPartition.types:
                return "RESOURCE_VIEW.PARTITIONS.TYPES";
            default: 
                return partition; //return the same partition ID
        }
    }

    public static getResourceViewPartitionAddBtnTranslationKey(partition: ResViewPartition): string {
        switch (partition) {
            case ResViewPartition.broaders:
                return "DATA.ACTIONS.ADD_BROADER";
            case ResViewPartition.classaxioms:
                return "DATA.ACTIONS.ADD_CLASS_AXIOM";
            case ResViewPartition.constituents:
                return "DATA.ACTIONS.SET_CONSTITUENTS";
            case ResViewPartition.datatypeDefinitions:
                return "DATA.ACTIONS.SET_DATATYPE_RESTRICTIONS";
            case ResViewPartition.denotations:
                return "DATA.ACTIONS.ADD_DENOTATION";
            case ResViewPartition.disjointProperties:
                return "DATA.ACTIONS.ADD_DISJOINT_PROPERTY";
            case ResViewPartition.domains:
                return "DATA.ACTIONS.ADD_DOMAIN";
            case ResViewPartition.equivalentProperties:
                return "DATA.ACTIONS.ADD_EQUIVALENT_PROPERTY";
            case ResViewPartition.evokedLexicalConcepts:
                return "DATA.ACTIONS.ADD_EVOKED_LEXICAL_CONCEPT";
            case ResViewPartition.facets:
                return "DATA.ACTIONS.ADD_INVERSE_PROPERTY";
            case ResViewPartition.formBasedPreview:
                return ""; //add not available
            case ResViewPartition.formRepresentations:
                return "DATA.ACTIONS.ADD_FORM_REPRESENTATION";
            case ResViewPartition.imports:
                return "DATA.ACTIONS.ADD_IMPORT";
            case ResViewPartition.labelRelations:
                return "DATA.ACTIONS.ADD_LABEL_RELATION";
            case ResViewPartition.lexicalForms:
                return "DATA.ACTIONS.ADD_LEX_FORM";
            case ResViewPartition.lexicalSenses:
                return "DATA.ACTIONS.ADD_LEXICAL_SENSE";
            case ResViewPartition.lexicalizations:
                return "DATA.ACTIONS.ADD_LEXICALIZATION";
            case ResViewPartition.members:
                return "DATA.ACTIONS.ADD_MEMBER";
            case ResViewPartition.membersOrdered:
                return "DATA.ACTIONS.ADD_MEMBER";
            case ResViewPartition.notes:
                return "DATA.ACTIONS.ADD_NOTE";
            case ResViewPartition.properties:
                return "DATA.ACTIONS.ADD_PROPERTY";
            case ResViewPartition.ranges:
                return "DATA.ACTIONS.ADD_RANGE";
            case ResViewPartition.rdfsMembers:
                return "DATA.ACTIONS.ADD_MEMBER";
            case ResViewPartition.schemes:
                return "DATA.ACTIONS.ADD_SCHEME";
            case ResViewPartition.subPropertyChains:
                return "DATA.ACTIONS.ADD_PROPERTY_CHAIN_AXIOM";
            case ResViewPartition.subterms:
                return "DATA.ACTIONS.ADD_SUBTERM";
            case ResViewPartition.superproperties:
                return "DATA.ACTIONS.ADD_SUPERPROPERTY";
            case ResViewPartition.topconceptof:
                return "DATA.ACTIONS.ADD_SCHEME";
            case ResViewPartition.types:
                return "DATA.ACTIONS.ADD_TYPE";
            default:
                return "ACTIONS.ADD";
        }
    }

    /**
     * Returns the root properties of a given partition.
     * Root properties are those properties prompted when the user is enriching a resource from a ResView partition
     */
    public static getPartitionRootProperties(partition: ResViewPartition): ARTURIResource[] {
        if (partition == ResViewPartition.broaders) {
            return [SKOS.broader];
        } else if (partition == ResViewPartition.classaxioms) {
            return [RDFS.subClassOf, OWL.equivalentClass, OWL.disjointWith, OWL.complementOf, OWL.intersectionOf, OWL.unionOf, OWL.oneOf];
        } else if (partition == ResViewPartition.constituents) {
            return [Decomp.constituent];
        } else if (partition == ResViewPartition.datatypeDefinitions) {
            return [OWL.equivalentClass]; //set, but not used
        } else if (partition == ResViewPartition.denotations) {
            return [OntoLex.denotes];
        } else if (partition == ResViewPartition.disjointProperties) {
            return [OWL.propertyDisjointWith];
        } else if (partition == ResViewPartition.domains) {
            return [RDFS.domain];
        } else if (partition == ResViewPartition.equivalentProperties) {
            return [OWL.equivalentProperty];
        } else if (partition == ResViewPartition.evokedLexicalConcepts) {
            return [OntoLex.evokes];
        } else if (partition == ResViewPartition.facets) {
            return [OWL.inverseOf];
        } else if (partition == ResViewPartition.formBasedPreview) {
            return []; //not used
        } else if (partition == ResViewPartition.formRepresentations) {
            return [OntoLex.representation];
        } else if (partition == ResViewPartition.imports) {
            return [OWL.imports];
        } else if (partition == ResViewPartition.labelRelations) {
            return [SKOSXL.labelRelation];
        } else if (partition == ResViewPartition.lexicalForms) {
            return [OntoLex.otherForm, OntoLex.canonicalForm];
        } else if (partition == ResViewPartition.lexicalSenses) {
            return [OntoLex.sense];
        } else if (partition == ResViewPartition.lexicalizations) {
            return []; //retrieved from server
        } else if (partition == ResViewPartition.members) {
            return [SKOS.member];
        } else if (partition == ResViewPartition.membersOrdered) {
            return [SKOS.memberList]; //provided but not used in the RV partition renderer
        } else if (partition == ResViewPartition.notes) {
            return [SKOS.note];
        } else if (partition == ResViewPartition.properties) {
            return []; //retrieved from server
        } else if (partition == ResViewPartition.ranges) {
            return [RDFS.range];
        } else if (partition == ResViewPartition.rdfsMembers) {
            return [RDFS.member];
        } else if (partition == ResViewPartition.schemes) {
            return [SKOS.inScheme];
        } else if (partition == ResViewPartition.subPropertyChains) {
            return [OWL.propertyChainAxiom];
        } else if (partition == ResViewPartition.subterms) {
            return [Decomp.subterm];
        } else if (partition == ResViewPartition.superproperties) {
            return [RDFS.subPropertyOf];
        } else if (partition == ResViewPartition.topconceptof) {
            return [SKOS.topConceptOf];
        } else if (partition == ResViewPartition.types) {
            return [RDF.type];
        } else {
            return []; //for unknown or custom partitions
        }
    }

    /**
     * Returns the known properties of the given partition.
     * The known properties are those properties that are described in the partition and for which exists dedicated add/remove services
     * (e.g. rdfs:label, skos(xl):pref/alt/hiddenLabel have dedicated service in lexicalizations partition).
     * The known properties are used only in Multi-root partition renderer in order to know if the partition is able to handle the add
     * and delete operations.
     */
    public static getPartitionKnownProperties(partition: ResViewPartition): ARTURIResource[] {
        if (partition == ResViewPartition.lexicalizations) {
            return [
                RDFS.label, SKOS.prefLabel, SKOS.altLabel, SKOS.hiddenLabel,
                SKOSXL.prefLabel, SKOSXL.altLabel, SKOSXL.hiddenLabel, OntoLex.isDenotedBy
            ];
        } else {
            return this.getPartitionRootProperties(partition);
        }
    }

}

export class PropertyFacet {
    name: string;
    value: boolean;
    explicit: boolean;
}

export enum PropertyFacetsEnum {
    symmetric = "symmetric",
    asymmetric = "asymmetric",
    functional = "functional",
    inverseFunctional = "inverseFunctional",
    reflexive = "reflexive",
    irreflexive = "irreflexive",
    transitive = "transitive"
}

export enum AddAction {
    default = "default",
    manually = "manually",
    remote = "remote"
}

export class ResourceViewCtx {
    versions: VersionInfo[]; //caches the versions for sharing them among different ResView (no need to initialize them at each RV)
}