import {ARTURIResource, RDFResourceRolesEnum} from "./ARTResources";

export class RDF {
    public static uri = "http://www.w3.org/1999/02/22-rdf-syntax-ns";
    public static namespace = RDF.uri + "#";
    // CLASSES
    public static alt = new ARTURIResource(RDF.namespace + "Alt", "rdf:Alt", RDFResourceRolesEnum.cls);
    public static bag = new ARTURIResource(RDF.namespace + "Bag", "rdf:Bag", RDFResourceRolesEnum.cls);
    public static list = new ARTURIResource(RDF.namespace + "List", "rdf:List", RDFResourceRolesEnum.cls);
    public static property = new ARTURIResource(RDF.namespace + "Property", "rdf:Property", RDFResourceRolesEnum.cls);
    public static seq = new ARTURIResource(RDF.namespace + "Seq", "rdf:Seq", RDFResourceRolesEnum.cls);
    public static statement = new ARTURIResource(RDF.namespace + "Statement", "rdf:Statement", RDFResourceRolesEnum.cls);
    public static xmlLiteral = new ARTURIResource(RDF.namespace + "XMLLiteral", "rdf:XMLLiteral", RDFResourceRolesEnum.cls);
    //PROPERTIES
    public static first = new ARTURIResource(RDF.namespace + "first", "rdf:first", RDFResourceRolesEnum.property);
    public static object = new ARTURIResource(RDF.namespace + "object", "rdf:object", RDFResourceRolesEnum.property);
    public static predicate = new ARTURIResource(RDF.namespace + "predicate", "rdf:predicate", RDFResourceRolesEnum.property);
    public static rest = new ARTURIResource(RDF.namespace + "rest", "rdf:rest", RDFResourceRolesEnum.property);
    public static subject = new ARTURIResource(RDF.namespace + "subject", "rdf:subject", RDFResourceRolesEnum.property);
    public static type = new ARTURIResource(RDF.namespace + "type", "rdf:type", RDFResourceRolesEnum.property);
    public static value = new ARTURIResource(RDF.namespace + "value", "rdf:value", RDFResourceRolesEnum.property);
    //INDIVIDUALS
    public static nil = new ARTURIResource(RDF.namespace + "nil", "rdf:nil", RDFResourceRolesEnum.individual);
}

export class RDFS {
    public static uri = "http://www.w3.org/2000/01/rdf-schema";
    public static namespace = RDFS.uri + "#";
    //CLASSES
    public static class = new ARTURIResource(RDFS.namespace + "Class", "rdfs:Class", RDFResourceRolesEnum.cls);
    public static container = new ARTURIResource(RDFS.namespace + "Container", "rdfs:Container", RDFResourceRolesEnum.cls);
    public static containerMembershipProperty = new ARTURIResource(RDFS.namespace + "ContainerMembershipProperty", "rdfs:resource", RDFResourceRolesEnum.cls);
    public static datatype = new ARTURIResource(RDFS.namespace + "Datatype", "rdfs:Datatype", RDFResourceRolesEnum.cls);
    public static literal = new ARTURIResource(RDFS.namespace + "Literal", "rdfs:Literal", RDFResourceRolesEnum.cls);
    public static resource = new ARTURIResource(RDFS.namespace + "Resource", "rdfs:Resource", RDFResourceRolesEnum.cls);
    //PROPERTIES
    public static comment = new ARTURIResource(RDFS.namespace + "comment", "rdfs:comment", RDFResourceRolesEnum.annotationProperty);
    public static domain = new ARTURIResource(RDFS.namespace + "domain", "rdfs:domain", RDFResourceRolesEnum.property);
    public static isDefinedBy = new ARTURIResource(RDFS.namespace + "isDefinedBy", "rdfs:isDefinedBy", RDFResourceRolesEnum.annotationProperty);
    public static label = new ARTURIResource(RDFS.namespace + "label", "rdfs:label", RDFResourceRolesEnum.annotationProperty);
    public static member = new ARTURIResource(RDFS.namespace + "member", "rdfs:member", RDFResourceRolesEnum.property);
    public static range = new ARTURIResource(RDFS.namespace + "range", "rdfs:range", RDFResourceRolesEnum.property);
    public static seeAlso = new ARTURIResource(RDFS.namespace + "seeAlso", "rdfs:seeAlso", RDFResourceRolesEnum.annotationProperty);
    public static subClassOf = new ARTURIResource(RDFS.namespace + "subClassOf", "rdfs:subClassOf", RDFResourceRolesEnum.property);
    public static subPropertyOf = new ARTURIResource(RDFS.namespace + "subPropertyOf", "rdfs:subPropertyOf", RDFResourceRolesEnum.property);
}

export class OWL {
    public static uri = "http://www.w3.org/2002/07/owl";
    public static namespace = OWL.uri + "#";

    // OWL Lite
    //CLASSES
    public static allDifferent = new ARTURIResource(OWL.namespace + "AllDifferent", "owl:AllDifferent", RDFResourceRolesEnum.cls);
    public static annotationProperty = new ARTURIResource(OWL.namespace + "AnnotationProperty", "owl:AnnotationProperty", RDFResourceRolesEnum.cls);
    public static asymmetricProperty = new ARTURIResource(OWL.namespace + "AsymmetricProperty", "owl:AsymmetricProperty", RDFResourceRolesEnum.cls);
    public static class = new ARTURIResource(OWL.namespace + "Class", "owl:Class", RDFResourceRolesEnum.cls);
    public static datatypeProperty = new ARTURIResource(OWL.namespace + "DatatypeProperty", "owl:DatatypeProperty", RDFResourceRolesEnum.cls);
    public static deprecatedClass = new ARTURIResource(OWL.namespace + "DeprecatedClass", "owl:DeprecatedClass", RDFResourceRolesEnum.cls);
    public static deprecatedProperty = new ARTURIResource(OWL.namespace + "DeprecatedProperty", "owl:DeprecatedProperty", RDFResourceRolesEnum.cls);
    public static functionalProperty = new ARTURIResource(OWL.namespace + "FunctionalProperty", "owl:FunctionalProperty", RDFResourceRolesEnum.cls);
    public static inverseFunctionalProperty = new ARTURIResource(OWL.namespace + "InverseFunctionalProperty", "owl:InverseFunctionalProperty", RDFResourceRolesEnum.cls);
    public static irreflexiveProperty = new ARTURIResource(OWL.namespace + "IrreflexiveProperty", "owl:IrreflexiveProperty", RDFResourceRolesEnum.cls);
    public static objectProperty = new ARTURIResource(OWL.namespace + "ObjectProperty", "owl:ObjectProperty", RDFResourceRolesEnum.cls);
    public static ontology = new ARTURIResource(OWL.namespace + "Ontology", "owl:Ontology", RDFResourceRolesEnum.cls);
    public static ontologyProperty = new ARTURIResource(OWL.namespace + "OntologyProperty", "owl:OntologyProperty", RDFResourceRolesEnum.cls);
    public static reflexiveProperty = new ARTURIResource(OWL.namespace + "ReflexiveProperty", "owl:ReflexiveProperty", RDFResourceRolesEnum.cls);
    public static restriction = new ARTURIResource(OWL.namespace + "Restriction", "owl:Restriction", RDFResourceRolesEnum.cls);
    public static symmetricProperty = new ARTURIResource(OWL.namespace + "SymmetricProperty", "owl:SymmetricProperty", RDFResourceRolesEnum.cls);
    public static transitiveProperty = new ARTURIResource(OWL.namespace + "TransitiveProperty", "owl:TransitiveProperty", RDFResourceRolesEnum.cls);
    //PROPERTIES
    public static allValuesFrom = new ARTURIResource(OWL.namespace + "allValuesFrom", "owl:allValuesFrom", RDFResourceRolesEnum.property);
    public static backwardCompatibleWith = new ARTURIResource(OWL.namespace + "backwardCompatibleWith", "owl:backwardCompatibleWith", RDFResourceRolesEnum.ontologyProperty);
    public static cardinality = new ARTURIResource(OWL.namespace + "cardinality", "owl:cardinality", RDFResourceRolesEnum.property);
    public static differentFrom = new ARTURIResource(OWL.namespace + "differentFrom", "owl:differentFrom", RDFResourceRolesEnum.property);
    public static distinctMembers = new ARTURIResource(OWL.namespace + "distinctMembers", "owl:distinctMembers", RDFResourceRolesEnum.property);
    public static equivalentClass = new ARTURIResource(OWL.namespace + "equivalentClass", "owl:equivalentClass", RDFResourceRolesEnum.property);
    public static equivalentProperty = new ARTURIResource(OWL.namespace + "equivalentProperty", "owl:equivalentProperty", RDFResourceRolesEnum.property);
    public static imports = new ARTURIResource(OWL.namespace + "imports", "owl:imports", RDFResourceRolesEnum.ontologyProperty);
    public static incompatibleWith = new ARTURIResource(OWL.namespace + "incompatibleWith", "owl:incompatibleWith", RDFResourceRolesEnum.ontologyProperty);
    public static intersectionOf = new ARTURIResource(OWL.namespace + "intersectionOf", "owl:intersectionOf", RDFResourceRolesEnum.property);
    public static inverseOf = new ARTURIResource(OWL.namespace + "inverseOf", "owl:inverseOf", RDFResourceRolesEnum.property);
    public static maxCardinality = new ARTURIResource(OWL.namespace + "maxCardinality", "owl:maxCardinality", RDFResourceRolesEnum.property);
    public static minCardinality = new ARTURIResource(OWL.namespace + "minCardinality", "owl:minCardinality", RDFResourceRolesEnum.property);
    public static onProperty = new ARTURIResource(OWL.namespace + "onProperty", "owl:onProperty", RDFResourceRolesEnum.property);
    public static priorVersion = new ARTURIResource(OWL.namespace + "priorVersion", "owl:priorVersion", RDFResourceRolesEnum.ontologyProperty);
    public static sameAs = new ARTURIResource(OWL.namespace + "sameAs", "owl:sameAs", RDFResourceRolesEnum.property);
    public static someValuesFrom = new ARTURIResource(OWL.namespace + "someValuesFrom", "owl:someValuesFrom", RDFResourceRolesEnum.property);
    public static versionInfo = new ARTURIResource(OWL.namespace + "versionInfo", "owl:versionInfo", RDFResourceRolesEnum.annotationProperty);

    // OWL DL and OWL Full
    //CLASSES
    public static dataRange = new ARTURIResource(OWL.namespace + "DataRange", "owl:DataRange", RDFResourceRolesEnum.cls);
    public static nothing = new ARTURIResource(OWL.namespace + "Nothing", "owl:Nothing", RDFResourceRolesEnum.cls);
    public static thing = new ARTURIResource(OWL.namespace + "Thing", "owl:Thing", RDFResourceRolesEnum.cls);
    //PROPERTIES
    public static complementOf = new ARTURIResource(OWL.namespace + "complementOf", "owl:complementOf", RDFResourceRolesEnum.property);
    public static disjointWith = new ARTURIResource(OWL.namespace + "disjointWith", "owl:disjointWith", RDFResourceRolesEnum.property);
    public static hasValue = new ARTURIResource(OWL.namespace + "hasValue", "owl:hasValue", RDFResourceRolesEnum.property);
    public static oneOf = new ARTURIResource(OWL.namespace + "oneOf", "owl:oneOf", RDFResourceRolesEnum.property);
    public static unionOf = new ARTURIResource(OWL.namespace + "unionOf", "owl:unionOf", RDFResourceRolesEnum.property);
}

export class SKOS {
    public static uri = "http://www.w3.org/2004/02/skos/core";
    public static namespace = SKOS.uri + "#";
    //CLASSES
    public static collection = new ARTURIResource(SKOS.namespace + "Collection", "skos:Collection", RDFResourceRolesEnum.cls);
    public static concept = new ARTURIResource(SKOS.namespace + "Concept", "skos:Concept", RDFResourceRolesEnum.cls);
    public static conceptScheme = new ARTURIResource(SKOS.namespace + "ConceptScheme", "skos:ConceptScheme", RDFResourceRolesEnum.cls);
    public static orderedCollection = new ARTURIResource(SKOS.namespace + "OrderedCollection", "skos:OrderedCollection", RDFResourceRolesEnum.cls);
    //PROPERTIES
    public static altLabel = new ARTURIResource(SKOS.namespace + "altLabel", "skos:altLabel", RDFResourceRolesEnum.annotationProperty);
    public static broadMatch = new ARTURIResource(SKOS.namespace + "broadMatch", "skos:broadMatch", RDFResourceRolesEnum.objectProperty);
    public static broader = new ARTURIResource(SKOS.namespace + "broader", "skos:broader", RDFResourceRolesEnum.objectProperty);
    public static broaderTransitive = new ARTURIResource(SKOS.namespace + "broaderTransitive", "skos:broaderTransitive", RDFResourceRolesEnum.objectProperty);
    public static changeNote = new ARTURIResource(SKOS.namespace + "changeNote", "skos:changeNote", RDFResourceRolesEnum.annotationProperty);
    public static closeMatch = new ARTURIResource(SKOS.namespace + "closeMatch", "skos:closeMatch", RDFResourceRolesEnum.objectProperty);
    public static definition = new ARTURIResource(SKOS.namespace + "definition", "skos:definition", RDFResourceRolesEnum.annotationProperty);
    public static editorialNote = new ARTURIResource(SKOS.namespace + "editorialNote", "skos:editorialNote", RDFResourceRolesEnum.annotationProperty);
    public static exactMatch = new ARTURIResource(SKOS.namespace + "exactMatch", "skos:exactMatch", RDFResourceRolesEnum.objectProperty);
    public static example = new ARTURIResource(SKOS.namespace + "example", "skos:example", RDFResourceRolesEnum.annotationProperty);
    public static hasTopConcept = new ARTURIResource(SKOS.namespace + "hasTopConcept", "skos:hasTopConcept", RDFResourceRolesEnum.objectProperty);
    public static hiddenLabel = new ARTURIResource(SKOS.namespace + "hiddenLabel", "skos:hiddenLabel", RDFResourceRolesEnum.annotationProperty);
    public static historyNote = new ARTURIResource(SKOS.namespace + "historyNote", "skos:historyNote", RDFResourceRolesEnum.annotationProperty);
    public static inScheme = new ARTURIResource(SKOS.namespace + "inScheme", "skos:inScheme", RDFResourceRolesEnum.objectProperty);
    public static mappingRelation = new ARTURIResource(SKOS.namespace + "mappingRelation", "skos:mappingRelation", RDFResourceRolesEnum.objectProperty);
    public static member = new ARTURIResource(SKOS.namespace + "member", "skos:member", RDFResourceRolesEnum.objectProperty);
    public static memberList = new ARTURIResource(SKOS.namespace + "memberList", "skos:memberList", RDFResourceRolesEnum.objectProperty);
    public static narrowMatch = new ARTURIResource(SKOS.namespace + "narrowMatch", "skos:narrowMatch", RDFResourceRolesEnum.objectProperty);
    public static narrower = new ARTURIResource(SKOS.namespace + "narrower", "skos:narrower", RDFResourceRolesEnum.objectProperty);
    public static narrowerTransitive = new ARTURIResource(SKOS.namespace + "narrowerTransitive", "skos:narrowerTransitive", RDFResourceRolesEnum.objectProperty);
    public static notation = new ARTURIResource(SKOS.namespace + "notation", "skos:notation", RDFResourceRolesEnum.datatypeProperty);
    public static note = new ARTURIResource(SKOS.namespace + "note", "skos:note", RDFResourceRolesEnum.annotationProperty);
    public static prefLabel = new ARTURIResource(SKOS.namespace + "prefLabel", "skos:prefLabel", RDFResourceRolesEnum.annotationProperty);
    public static related = new ARTURIResource(SKOS.namespace + "related", "skos:related", RDFResourceRolesEnum.objectProperty);
    public static relatedMatch = new ARTURIResource(SKOS.namespace + "relatedMatch", "skos:relatedMatch", RDFResourceRolesEnum.objectProperty);
    public static scopeNote = new ARTURIResource(SKOS.namespace + "scopeNote", "skos:scopeNote", RDFResourceRolesEnum.annotationProperty);
    public static semanticRelation = new ARTURIResource(SKOS.namespace + "semanticRelation", "skos:semanticRelation", RDFResourceRolesEnum.objectProperty);
    public static topConceptOf = new ARTURIResource(SKOS.namespace + "topConceptOf", "skos:topConceptOf", RDFResourceRolesEnum.objectProperty);
}

export class SKOSXL {
    public static uri = "http://www.w3.org/2008/05/skos-xl";
    public static namespace = SKOSXL.uri + "#";
    //CLASSES
    public static label = new ARTURIResource(SKOSXL.namespace + "Label", "skosxl:Label", RDFResourceRolesEnum.cls);
    //PROPERTIES
    public static altLabel = new ARTURIResource(SKOSXL.namespace + "altLabel", "skosxl:altLabel", RDFResourceRolesEnum.objectProperty);
    public static hiddenLabel = new ARTURIResource(SKOSXL.namespace + "hiddenLabel", "skosxl:hiddenLabel", RDFResourceRolesEnum.objectProperty);
    public static labelRelation = new ARTURIResource(SKOSXL.namespace + "labelRelation", "skosxl:labelRelation", RDFResourceRolesEnum.objectProperty);
    public static literalForm = new ARTURIResource(SKOSXL.namespace + "literalForm", "skosxl:literalForm", RDFResourceRolesEnum.datatypeProperty);
    public static prefLabel = new ARTURIResource(SKOSXL.namespace + "prefLabel", "skosxl:prefLabel", RDFResourceRolesEnum.objectProperty);
}

export class XmlSchema { //all resources here have role "individual" (don't know if it's ok)
    public static uri = "http://www.w3.org/2001/XMLSchema";
    public static namespace = XmlSchema.uri + "#";
    
    public static anyURI = new ARTURIResource(XmlSchema.namespace + "anyURI", "xsd:anyURI", RDFResourceRolesEnum.individual);
    public static base64Binary = new ARTURIResource(XmlSchema.namespace + "base64Binary", "xsd:base64Binary", RDFResourceRolesEnum.individual);
    public static boolean = new ARTURIResource(XmlSchema.namespace + "boolean", "xsd:boolean", RDFResourceRolesEnum.individual);
    public static date = new ARTURIResource(XmlSchema.namespace + "date", "xsd:date", RDFResourceRolesEnum.individual);
    public static dateTime = new ARTURIResource(XmlSchema.namespace + "dateTime", "xsd:dateTime", RDFResourceRolesEnum.individual);
    public static decimal = new ARTURIResource(XmlSchema.namespace + "decimal", "xsd:decimal", RDFResourceRolesEnum.individual);
	public static double = new ARTURIResource(XmlSchema.namespace + "double", "xsd:double", RDFResourceRolesEnum.individual);
	public static duration = new ARTURIResource(XmlSchema.namespace + "duration", "xsd:duration", RDFResourceRolesEnum.individual);
    public static float = new ARTURIResource(XmlSchema.namespace + "float", "xsd:float", RDFResourceRolesEnum.individual);
    public static gDay = new ARTURIResource(XmlSchema.namespace + "gDay", "xsd:gDay", RDFResourceRolesEnum.individual);
	public static gMonth = new ARTURIResource(XmlSchema.namespace + "gMonth", "xsd:gMonth", RDFResourceRolesEnum.individual);
    public static gMonthDay = new ARTURIResource(XmlSchema.namespace + "gMonthDay", "xsd:gMonthDay", RDFResourceRolesEnum.individual);
	public static gYear = new ARTURIResource(XmlSchema.namespace + "gYear", "xsd:gYear", RDFResourceRolesEnum.individual);
	public static gYearMonth = new ARTURIResource(XmlSchema.namespace + "gYearMonth", "xsd:gYearMonth", RDFResourceRolesEnum.individual);
    public static hexBinary = new ARTURIResource(XmlSchema.namespace + "hexBinary", "xsd:hexBinary", RDFResourceRolesEnum.individual);
    public static NOTATION = new ARTURIResource(XmlSchema.namespace + "NOTATION", "xsd:NOTATION", RDFResourceRolesEnum.individual);
    public static QName = new ARTURIResource(XmlSchema.namespace + "QName", "xsd:QName", RDFResourceRolesEnum.individual);
    public static string = new ARTURIResource(XmlSchema.namespace + "string", "xsd:string", RDFResourceRolesEnum.individual);
	public static time = new ARTURIResource(XmlSchema.namespace + "time", "xsd:time", RDFResourceRolesEnum.individual);
	//Derived datatypes
    public static byte = new ARTURIResource(XmlSchema.namespace + "byte", "xsd:byte", RDFResourceRolesEnum.individual);
    public static ENTITIES = new ARTURIResource(XmlSchema.namespace + "ENTITIES", "xsd:ENTITIES", RDFResourceRolesEnum.individual);
    public static ENTITY = new ARTURIResource(XmlSchema.namespace + "ENTITY", "xsd:ENTITY", RDFResourceRolesEnum.individual);
    public static ID = new ARTURIResource(XmlSchema.namespace + "ID", "xsd:ID", RDFResourceRolesEnum.individual);
	public static IDREF = new ARTURIResource(XmlSchema.namespace + "IDREF", "xsd:IDREF", RDFResourceRolesEnum.individual);
	public static IDREFS = new ARTURIResource(XmlSchema.namespace + "IDREFS", "xsd:IDREFS", RDFResourceRolesEnum.individual);
    public static int = new ARTURIResource(XmlSchema.namespace + "int", "xsd:int", RDFResourceRolesEnum.individual);
    public static integer = new ARTURIResource(XmlSchema.namespace + "integer", "xsd:integer", RDFResourceRolesEnum.individual);
    public static language = new ARTURIResource(XmlSchema.namespace + "language", "xsd:language", RDFResourceRolesEnum.individual);
    public static long = new ARTURIResource(XmlSchema.namespace + "long", "xsd:long", RDFResourceRolesEnum.individual);
    public static Name = new ARTURIResource(XmlSchema.namespace + "Name", "xsd:Name", RDFResourceRolesEnum.individual);
    public static NCName = new ARTURIResource(XmlSchema.namespace + "NCName", "xsd:NCName", RDFResourceRolesEnum.individual);
    public static negativeInteger = new ARTURIResource(XmlSchema.namespace + "negativeInteger", "xsd:negativeInteger", RDFResourceRolesEnum.individual);
    public static NMTOKEN = new ARTURIResource(XmlSchema.namespace + "NMTOKEN", "xsd:NMTOKEN", RDFResourceRolesEnum.individual);
	public static NMTOKENS = new ARTURIResource(XmlSchema.namespace + "NMTOKENS", "xsd:NMTOKENS", RDFResourceRolesEnum.individual);
    public static nonNegativeInteger = new ARTURIResource(XmlSchema.namespace + "nonNegativeInteger", "xsd:nonNegativeInteger", RDFResourceRolesEnum.individual);
    public static nonPositiveInteger = new ARTURIResource(XmlSchema.namespace + "nonPositiveInteger", "xsd:nonPositiveInteger", RDFResourceRolesEnum.individual);
	public static normalizedString = new ARTURIResource(XmlSchema.namespace + "normalizedString", "xsd:normalizedString", RDFResourceRolesEnum.individual);
    public static positiveInteger = new ARTURIResource(XmlSchema.namespace + "positiveInteger", "xsd:positiveInteger", RDFResourceRolesEnum.individual);
    public static short = new ARTURIResource(XmlSchema.namespace + "short", "xsd:short", RDFResourceRolesEnum.individual);
	public static token = new ARTURIResource(XmlSchema.namespace + "token", "xsd:token", RDFResourceRolesEnum.individual);
	public static unsignedByte = new ARTURIResource(XmlSchema.namespace + "unsignedByte", "xsd:unsignedByte", RDFResourceRolesEnum.individual);
	public static unsignedInt = new ARTURIResource(XmlSchema.namespace + "unsignedInt", "xsd:unsignedInt", RDFResourceRolesEnum.individual);
    public static unsignedLong = new ARTURIResource(XmlSchema.namespace + "unsignedLong", "xsd:unsignedLong", RDFResourceRolesEnum.individual);
	public static unsignedShort = new ARTURIResource(XmlSchema.namespace + "unsignedShort", "xsd:unsignedShort", RDFResourceRolesEnum.individual);

}


export class DC {
    public static uri = "http://purl.org/dc/terms";
    public static namespace = DC.uri + "/";
    //PROPERTIES
    public static created = new ARTURIResource(DC.namespace + "created", "dc:created", RDFResourceRolesEnum.property);
    public static modified = new ARTURIResource(DC.namespace + "modified", "dc:modified", RDFResourceRolesEnum.property);
}