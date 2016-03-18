import {ARTURIResource} from "./ARTResources";

export class RDF {
    public static uri = "http://www.w3.org/1999/02/22-rdf-syntax-ns";
    public static namespace = RDF.uri + "#";
    // CLASSES
    public static alt = new ARTURIResource(RDF.namespace + "Alt", "rdf:Alt", "cls");
    public static bag = new ARTURIResource(RDF.namespace + "Bag", "rdf:Bag", "cls");
    public static list = new ARTURIResource(RDF.namespace + "List", "rdf:List", "cls");
    public static property = new ARTURIResource(RDF.namespace + "Property", "rdf:Property", "cls");
    public static seq = new ARTURIResource(RDF.namespace + "Seq", "rdf:Seq", "cls");
    public static statement = new ARTURIResource(RDF.namespace + "Statement", "rdf:Statement", "cls");
    public static xmlLiteral = new ARTURIResource(RDF.namespace + "XMLLiteral", "rdf:XMLLiteral", "cls");
    //PROPERTIES
    public static first = new ARTURIResource(RDF.namespace + "first", "rdf:first", "property");
    public static object = new ARTURIResource(RDF.namespace + "object", "rdf:object", "property");
    public static predicate = new ARTURIResource(RDF.namespace + "predicate", "rdf:predicate", "property");
    public static rest = new ARTURIResource(RDF.namespace + "rest", "rdf:rest", "property");
    public static subject = new ARTURIResource(RDF.namespace + "subject", "rdf:subject", "property");
    public static type = new ARTURIResource(RDF.namespace + "type", "rdf:type", "property");
    public static value = new ARTURIResource(RDF.namespace + "value", "rdf:value", "property");
    //INDIVIDUALS
    public static nil = new ARTURIResource(RDF.namespace + "nil", "rdf:nil", "individual");
}

export class RDFS {
    public static uri = "http://www.w3.org/2000/01/rdf-schema";
    public static namespace = RDFS.uri + "#";
    //CLASSES
    public static class = new ARTURIResource(RDFS.namespace + "Class", "rdfs:Class", "cls");
    public static container = new ARTURIResource(RDFS.namespace + "Container", "rdfs:Container", "cls");
    public static containerMembershipProperty = new ARTURIResource(RDFS.namespace + "ContainerMembershipProperty", "rdfs:resource", "cls");
    public static datatype = new ARTURIResource(RDFS.namespace + "Datatype", "rdfs:Datatype", "cls");
    public static literal = new ARTURIResource(RDFS.namespace + "Literal", "rdfs:Literal", "cls");
    public static resource = new ARTURIResource(RDFS.namespace + "Resource", "rdfs:Resource", "cls");
    //PROPERTIES
    public static comment = new ARTURIResource(RDFS.namespace + "comment", "rdfs:comment", "annotationProperty");
    public static domain = new ARTURIResource(RDFS.namespace + "domain", "rdfs:domain", "property");
    public static isDefinedBy = new ARTURIResource(RDFS.namespace + "isDefinedBy", "rdfs:isDefinedBy", "annotationProperty");
    public static label = new ARTURIResource(RDFS.namespace + "label", "rdfs:label", "annotationProperty");
    public static member = new ARTURIResource(RDFS.namespace + "member", "rdfs:member", "property");
    public static range = new ARTURIResource(RDFS.namespace + "range", "rdfs:range", "property");
    public static seeAlso = new ARTURIResource(RDFS.namespace + "seeAlso", "rdfs:seeAlso", "annotationProperty");
    public static subClassOf = new ARTURIResource(RDFS.namespace + "subClassOf", "rdfs:subClassOf", "property");
    public static subPropertyOf = new ARTURIResource(RDFS.namespace + "subPropertyOf", "rdfs:subPropertyOf", "property");
}

export class OWL {
    public static uri = "http://www.w3.org/2002/07/owl";
    public static namespace = OWL.uri + "#";

	// OWL Lite
    //CLASSES
    public static allDifferent = new ARTURIResource(OWL.namespace + "AllDifferent", "owl:AllDifferent", "cls");
    public static annotationProperty = new ARTURIResource(OWL.namespace + "AnnotationProperty", "owl:AnnotationProperty", "cls");
	public static class = new ARTURIResource(OWL.namespace + "Class", "owl:Class", "cls");
    public static datatypeProperty = new ARTURIResource(OWL.namespace + "DatatypeProperty", "owl:DatatypeProperty", "cls");
    public static deprecatedClass = new ARTURIResource(OWL.namespace + "DeprecatedClass", "owl:DeprecatedClass", "cls");
	public static deprecatedProperty = new ARTURIResource(OWL.namespace + "DeprecatedProperty", "owl:DeprecatedProperty", "cls");
    public static functionalProperty = new ARTURIResource(OWL.namespace + "FunctionalProperty", "owl:FunctionalProperty", "cls");
	public static inverseFunctionalProperty = new ARTURIResource(OWL.namespace + "InverseFunctionalProperty", "owl:InverseFunctionalProperty", "cls");
    public static objectProperty = new ARTURIResource(OWL.namespace + "ObjectProperty", "owl:ObjectProperty", "cls");
    public static ontology = new ARTURIResource(OWL.namespace + "Ontology", "owl:Ontology", "cls");
    public static ontologyProperty = new ARTURIResource(OWL.namespace + "OntologyProperty", "owl:OntologyProperty", "cls");
    public static restriction = new ARTURIResource(OWL.namespace + "Restriction", "owl:Restriction", "cls");
	public static symmetricProperty = new ARTURIResource(OWL.namespace + "SymmetricProperty", "owl:SymmetricProperty", "cls");
    public static transitiveProperty = new ARTURIResource(OWL.namespace + "TransitiveProperty", "owl:TransitiveProperty", "cls");
    //PROPERTIES
    public static allValuesFrom = new ARTURIResource(OWL.namespace + "allValuesFrom", "owl:allValuesFrom", "property");
    public static backwardCompatibleWith = new ARTURIResource(OWL.namespace + "backwardCompatibleWith", "owl:backwardCompatibleWith", "ontologyProperty");
    public static cardinality = new ARTURIResource(OWL.namespace + "cardinality", "owl:cardinality", "property");
    public static differentFrom = new ARTURIResource(OWL.namespace + "differentFrom", "owl:differentFrom", "property");
	public static distinctMembers = new ARTURIResource(OWL.namespace + "distinctMembers", "owl:distinctMembers", "property");
	public static equivalentClass = new ARTURIResource(OWL.namespace + "equivalentClass", "owl:equivalentClass", "property");
	public static equivalentProperty = new ARTURIResource(OWL.namespace + "equivalentProperty", "owl:equivalentProperty", "property");
    public static imports = new ARTURIResource(OWL.namespace + "imports", "owl:imports", "ontologyProperty");
    public static incompatibleWith = new ARTURIResource(OWL.namespace + "incompatibleWith", "owl:incompatibleWith", "ontologyProperty");
	public static intersectionOf = new ARTURIResource(OWL.namespace + "intersectionOf", "owl:intersectionOf", "property");
    public static inverseOf = new ARTURIResource(OWL.namespace + "inverseOf", "owl:inverseOf", "property");
    public static maxCardinality = new ARTURIResource(OWL.namespace + "maxCardinality", "owl:maxCardinality", "property");
    public static minCardinality = new ARTURIResource(OWL.namespace + "minCardinality", "owl:minCardinality", "property");
	public static onProperty = new ARTURIResource(OWL.namespace + "onProperty", "owl:onProperty", "property");
    public static priorVersion = new ARTURIResource(OWL.namespace + "priorVersion", "owl:priorVersion", "ontologyProperty");
	public static sameAs = new ARTURIResource(OWL.namespace + "sameAs", "owl:sameAs", "property");
	public static someValuesFrom = new ARTURIResource(OWL.namespace + "someValuesFrom", "owl:someValuesFrom", "property");
	public static versionInfo = new ARTURIResource(OWL.namespace + "versionInfo", "owl:versionInfo", "annotationProperty");
	
	// OWL DL and OWL Full
    //CLASSES
    public static dataRange = new ARTURIResource(OWL.namespace + "DataRange", "owl:DataRange", "cls");
    public static nothing = new ARTURIResource(OWL.namespace + "Nothing", "owl:Nothing", "cls");
	public static thing = new ARTURIResource(OWL.namespace + "Thing", "owl:Thing", "cls");
    //PROPERTIES
	public static complementOf = new ARTURIResource(OWL.namespace + "complementOf", "owl:complementOf", "property");
    public static disjointWith = new ARTURIResource(OWL.namespace + "disjointWith", "owl:disjointWith", "property");
	public static hasValue = new ARTURIResource(OWL.namespace + "hasValue", "owl:hasValue", "property");
	public static oneOf = new ARTURIResource(OWL.namespace + "oneOf", "owl:oneOf", "property");
	public static unionOf = new ARTURIResource(OWL.namespace + "unionOf", "owl:unionOf", "property");
}

export class SKOS {
    public static uri = "http://www.w3.org/2004/02/skos/core";
    public static namespace = SKOS.uri + "#";
    //CLASSES
    public static collection = new ARTURIResource(SKOS.namespace + "Collection", "skos:Collection", "cls");
    public static concept = new ARTURIResource(SKOS.namespace + "Concept", "skos:Concept", "cls");
    public static conceptScheme = new ARTURIResource(SKOS.namespace + "ConceptScheme", "skos:ConceptScheme", "cls");
    public static orderedCollection = new ARTURIResource(SKOS.namespace + "OrderedCollection", "skos:OrderedCollection", "cls");
    //PROPERTIES
    public static altLabel = new ARTURIResource(SKOS.namespace + "altLabel", "skos:altLabel", "annotationProperty");
    public static broadMatch = new ARTURIResource(SKOS.namespace + "broadMatch", "skos:broadMatch", "objectProperty");
    public static broader = new ARTURIResource(SKOS.namespace + "broader", "skos:broader", "objectProperty");
    public static broaderTransitive = new ARTURIResource(SKOS.namespace + "broaderTransitive", "skos:broaderTransitive", "objectProperty");
    public static changeNote = new ARTURIResource(SKOS.namespace + "changeNote", "skos:changeNote", "annotationProperty");
    public static closeMatch = new ARTURIResource(SKOS.namespace + "closeMatch", "skos:closeMatch", "objectProperty");
    public static definition = new ARTURIResource(SKOS.namespace + "definition", "skos:definition", "annotationProperty");
    public static editorialNote = new ARTURIResource(SKOS.namespace + "editorialNote", "skos:editorialNote", "annotationProperty");
    public static exactMatch = new ARTURIResource(SKOS.namespace + "exactMatch", "skos:exactMatch", "objectProperty");
    public static example = new ARTURIResource(SKOS.namespace + "example", "skos:example", "annotationProperty");
    public static hasTopConcept = new ARTURIResource(SKOS.namespace + "hasTopConcept", "skos:hasTopConcept", "objectProperty");
    public static hiddenLabel = new ARTURIResource(SKOS.namespace + "hiddenLabel", "skos:hiddenLabel", "annotationProperty");
    public static historyNote = new ARTURIResource(SKOS.namespace + "historyNote", "skos:historyNote", "annotationProperty");
    public static inScheme = new ARTURIResource(SKOS.namespace + "inScheme", "skos:inScheme", "objectProperty");
    public static mappingRelation = new ARTURIResource(SKOS.namespace + "mappingRelation", "skos:mappingRelation", "objectProperty");   
    public static member = new ARTURIResource(SKOS.namespace + "member", "skos:member", "objectProperty");
    public static memberList = new ARTURIResource(SKOS.namespace + "memberList", "skos:memberList", "objectProperty");
    public static narrowMatch = new ARTURIResource(SKOS.namespace + "narrowMatch", "skos:narrowMatch", "objectProperty");   
    public static narrower = new ARTURIResource(SKOS.namespace + "narrower", "skos:narrower", "objectProperty");
    public static narrowerTransitive = new ARTURIResource(SKOS.namespace + "narrowerTransitive", "skos:narrowerTransitive", "objectProperty");   
    public static notation = new ARTURIResource(SKOS.namespace + "notation", "skos:notation", "datatypeProperty");
    public static note = new ARTURIResource(SKOS.namespace + "note", "skos:note", "annotationProperty");
    public static prefLabel = new ARTURIResource(SKOS.namespace + "prefLabel", "skos:prefLabel", "annotationProperty");   
    public static related = new ARTURIResource(SKOS.namespace + "related", "skos:related", "objectProperty");
    public static relatedMatch = new ARTURIResource(SKOS.namespace + "relatedMatch", "skos:relatedMatch", "objectProperty");   
    public static scopeNote = new ARTURIResource(SKOS.namespace + "scopeNote", "skos:scopeNote", "annotationProperty");
    public static semanticRelation = new ARTURIResource(SKOS.namespace + "semanticRelation", "skos:semanticRelation", "objectProperty");   
    public static topConceptOf = new ARTURIResource(SKOS.namespace + "topConceptOf", "skos:topConceptOf", "objectProperty");
}

export class SKOSXL {
    public static uri = "http://www.w3.org/2008/05/skos-xl";
    public static namespace = SKOSXL.uri + "#";
	//CLASSES
	public static label = new ARTURIResource(SKOSXL.namespace + "Label", "skosxl:Label", "cls");
	//PROPERTIES
    public static altLabel = new ARTURIResource(SKOSXL.namespace + "altLabel", "skosxl:altLabel", "objectProperty");
	public static hiddenLabel = new ARTURIResource(SKOSXL.namespace + "hiddenLabel", "skosxl:hiddenLabel", "objectProperty");
	public static labelRelation = new ARTURIResource(SKOSXL.namespace + "labelRelation", "skosxl:labelRelation", "objectProperty");
	public static literalForm = new ARTURIResource(SKOSXL.namespace + "literalForm", "skosxl:literalForm", "datatypeProperty");
	public static prefLabel = new ARTURIResource(SKOSXL.namespace + "prefLabel", "skosxl:prefLabel", "objectProperty");
}