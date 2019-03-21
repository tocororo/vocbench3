import { ARTURIResource } from "./ARTResources";
import { SKOS, OWL, RDFS, OntoLex, Decomp, SKOSXL, RDF } from "./Vocabulary";

export enum ResViewPartition {
    broaders = "broaders",
    classaxioms = "classaxioms",
    constituents = "constituents",
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

    public static getResourceViewPartitionLabel(partition: ResViewPartition): string {
        if (partition == ResViewPartition.classaxioms) {
            return "Class axioms";
        } else if (partition == ResViewPartition.disjointProperties) {
            return "Disjoint properties";
        } else if (partition == ResViewPartition.equivalentProperties) {
            return "Equivalent properties";
        } else if (partition == ResViewPartition.evokedLexicalConcepts) {
            return "Evoked Lexical Concepts";
        } else if (partition == ResViewPartition.facets) {
            return "Property facets";
        } else if (partition == ResViewPartition.formBasedPreview) {
            return "Custom Form Preview";
        } else if (partition == ResViewPartition.formRepresentations) {
            return "Form Representations";
        } else if (partition == ResViewPartition.labelRelations) {
            return "Label relations";
        } else if (partition == ResViewPartition.lexicalForms) {
            return "Lexical forms";
        } else if (partition == ResViewPartition.lexicalSenses) {
            return "Lexical senses";
        } else if (partition == ResViewPartition.membersOrdered) {
            return "Members (ordered)";
        } else if (partition == ResViewPartition.properties) {
            return "Other properties";
        } else if (partition == ResViewPartition.rdfsMembers) {
            return "RDFS members";
        } else if (partition == ResViewPartition.subPropertyChains) {
            return "Property chain axioms";
        } else if (partition == ResViewPartition.topconceptof) {
            return "Top Concept of";
        } else {
            //partition == ResViewPartition.broaders || partition == ResViewPartition.constituents || partition == ResViewPartition.denotations ||
            //partition == ResViewPartition.domains || partition == ResViewPartition.imports || partition == ResViewPartition.lexicalizations || 
            //partition == ResViewPartition.members || partition == ResViewPartition.notes || partition == ResViewPartition.ranges || 
            //partition == ResViewPartition.schemes || partition == ResViewPartition.subterms || partition == ResViewPartition.superproperties || 
            //partition == ResViewPartition.types
            return partition.charAt(0).toUpperCase() + partition.slice(1);
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