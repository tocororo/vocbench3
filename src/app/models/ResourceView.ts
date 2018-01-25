export type ResViewPartition = 
    "types" |
    "classaxioms" |
    "topconceptof" |
    "schemes" |
    "broaders" |
    "superproperties" |
    "domains" |
    "ranges" |
    "facets" |
    "lexicalizations" |
    "notes" |
    "membersOrdered" |
    "members" |
    "labelRelations" |
    "properties";

export const ResViewPartition = {
    types: "types" as ResViewPartition,
    classaxioms: "classaxioms" as ResViewPartition,
    topconceptof: "topconceptof" as ResViewPartition,
    schemes: "schemes" as ResViewPartition,
    broaders: "broaders" as ResViewPartition,
    superproperties: "superproperties" as ResViewPartition,
    domains: "domains" as ResViewPartition,
    ranges: "ranges" as ResViewPartition,
    facets: "facets" as ResViewPartition,
    lexicalizations: "lexicalizations" as ResViewPartition,
    notes: "notes" as ResViewPartition,
    membersOrdered: "membersOrdered" as ResViewPartition,
    members: "members" as ResViewPartition,
    labelRelations: "labelRelations" as ResViewPartition,
    properties: "properties" as ResViewPartition
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
        ResViewPartition.properties,
        ResViewPartition.ranges,
        ResViewPartition.schemes,
        ResViewPartition.superproperties,
        ResViewPartition.topconceptof,
        ResViewPartition.types
    ]

}