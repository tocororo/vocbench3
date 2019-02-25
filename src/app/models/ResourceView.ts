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

    public static getResourceViewPartitionLabel(partition: ResViewPartition): string {
        if (
            partition == ResViewPartition.broaders || partition == ResViewPartition.constituents || partition == ResViewPartition.denotations ||
            partition == ResViewPartition.domains || partition == ResViewPartition.imports || partition == ResViewPartition.lexicalizations || 
            partition == ResViewPartition.members || partition == ResViewPartition.notes || partition == ResViewPartition.ranges || 
            partition == ResViewPartition.schemes || partition == ResViewPartition.subterms || partition == ResViewPartition.superproperties || 
            partition == ResViewPartition.types
        ) {
            return partition.charAt(0).toUpperCase() + partition.slice(1);;
        } else if (partition == ResViewPartition.classaxioms) {
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
            return "Ohter properties";
        } else if (partition == ResViewPartition.rdfsMembers) {
            return "RDFS members";
        } else if (partition == ResViewPartition.subPropertyChains) {
            return "Property chain axioms";
        } else if (partition == ResViewPartition.topconceptof) {
            return "Top Concept of";
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