export enum ResViewPartition {
    broaders = "broaders",
    classaxioms = "classaxioms",
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
        ResViewPartition.schemes,
        ResViewPartition.subterms,
        ResViewPartition.superproperties,
        ResViewPartition.topconceptof,
        ResViewPartition.types
    ]

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