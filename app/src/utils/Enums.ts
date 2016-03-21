/**
 * String enums
 * See https://github.com/Microsoft/TypeScript/issues/3192 
 */

export type RDFResourceRolesEnum =
    "annotationProperty" | 
    "cls" |
    "concept" |
    "conceptScheme" |
    "dataRange" |
    "datatypeProperty" |
    "individual" |
    "objectProperty" |
    "ontology" |
    "ontologyProperty" |
    "property" |
    "undetermined" |
    "xLabel";
    
export const RDFResourceRolesEnum = {
    annotationProperty: "annotationProperty" as RDFResourceRolesEnum,
    cls: "cls" as RDFResourceRolesEnum,
    concept: "concept" as RDFResourceRolesEnum,
    conceptScheme: "conceptScheme" as RDFResourceRolesEnum,
    dataRange: "dataRange" as RDFResourceRolesEnum,
    datatypeProperty: "datatypeProperty" as RDFResourceRolesEnum,
    individual: "individual" as RDFResourceRolesEnum,
    objectProperty: "objectProperty" as RDFResourceRolesEnum,
    ontology: "ontology" as RDFResourceRolesEnum,
    ontologyProperty: "ontologyProperty" as RDFResourceRolesEnum,
    property: "property" as RDFResourceRolesEnum,
    undetermined: "undetermined" as RDFResourceRolesEnum,
    xLabel: "xLabel" as RDFResourceRolesEnum
};

export type RDFTypesEnum =
    "bnode" |
    "literal" |
    "plainLiteral" | 
    "resource" |
    "typedLiteral" |
    "undetermined" |
    "uri";
    
export const RDFTypesEnum = {
    bnode: "bnode" as RDFTypesEnum,
    literal: "literal" as RDFTypesEnum,
    plainLiteral: "plainLiteral" as RDFTypesEnum,
    resource: "resource" as RDFTypesEnum,
    typedLiteral: "typedLiteral" as RDFTypesEnum,
    undetermined: "undetermined" as RDFTypesEnum,
    uri: "uri" as RDFTypesEnum
}