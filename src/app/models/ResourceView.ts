export enum ResViewPartition {
    types = "types",
    classaxioms = "classaxioms",
    topconceptof = "topconceptof",
    schemes = "schemes",
    broaders = "broaders",
    superproperties = "superproperties",
    domains = "domains",
    ranges = "ranges",
    facets = "facets",
    lexicalizations = "lexicalizations",
    lexicalForms = "lexicalForms",
    notes = "notes",
    membersOrdered = "membersOrdered",
    members = "members",
    labelRelations = "labelRelations",
    properties = "properties"
}

export class ResViewUtils {

    /**
     * partitions where add manually functionality is enabled.
     * Note: if a partition is added, remember to change the implementation of checkTypeCompliantForManualAdd in the renderer.
     */
    public static addManuallyPartition: ResViewPartition[] = [
        ResViewPartition.broaders,
        ResViewPartition.classaxioms,
        ResViewPartition.domains,
        ResViewPartition.facets,
        ResViewPartition.labelRelations,
        ResViewPartition.members,
        ResViewPartition.notes,
        ResViewPartition.properties,
        ResViewPartition.ranges,
        ResViewPartition.schemes,
        ResViewPartition.superproperties,
        ResViewPartition.topconceptof,
        ResViewPartition.types
    ]

}