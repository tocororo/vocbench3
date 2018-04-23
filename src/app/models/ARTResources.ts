import { PrefixMapping } from "./Metadata";

export abstract class ARTNode {

    protected graphs: ARTURIResource[] = [];
    protected role: RDFResourceRolesEnum = RDFResourceRolesEnum.mention; //default, so node without role are considered mention

    constructor() { };

    isResource(): boolean {
        return false;
    }
    isURIResource(): boolean {
        return false;
    }
    isLiteral(): boolean {
        return false;
    }
    isBNode(): boolean {
        return false;
    }

    abstract getNominalValue(): string;
    abstract getShow(): string;

    setGraphs(graphs: ARTURIResource[]) {
        this.graphs = graphs;
    }
    addGraphs(graphsToAdd: ARTURIResource[]) {
        for (var i = 0; i < graphsToAdd.length; i++) {
            this.addGraph(graphsToAdd[i]);
        }
    }
    addGraph(graphToAdd: ARTURIResource) {
        for (var i = 0; i < this.graphs.length; i++) {
            if (graphToAdd.getURI() == this.graphs[i].getURI()) {
                return; //graph is already in graphs array => do not add the graph
            }
        }
        //graphToAdd not found in graphs array => add it
        this.graphs.push(graphToAdd);
    }
    getGraphs(): ARTURIResource[] {
        return this.graphs;
    }

    setRole(role: RDFResourceRolesEnum) {
        this.role = role;
    }
    getRole(): RDFResourceRolesEnum {
        return this.role;
    }

    abstract toNT(): string;

    setAdditionalProperty(propName: string, propValue: any): void {
        this[propName] = propValue;
    }
    deleteAdditionalProperty(propName: string) {
        delete this[propName];
    }
    getAdditionalProperty(propName: string) {
        return this[propName];
    }

    abstract clone(): ARTNode;
}

export abstract class ARTResource extends ARTNode {

    protected show: string;

    constructor(show?: string, role?: RDFResourceRolesEnum) {
        super();
        this.show = show;
        if (role != null) { this.role = role; }
    };

    isResource(): boolean {
        return true;
    }

    setShow(show: string) {
        this.show = show;
    }
    getShow(): string {
        if (this.show != null) {
            return this.show;
        } else {
            return this.getNominalValue();
        }
    }

    isDeprecated(): boolean {
        return this.getAdditionalProperty(ResAttribute.DEPRECATED);
    }

}

export class ARTURIResource extends ARTResource {
    private uri: string;

    constructor(uri: string, show?: string, role?: RDFResourceRolesEnum) {
        super(show, role);
        this.uri = uri;
    }

    setURI(uri: string) {
        this.uri = uri;
    }
    getURI(): string {
        return this.uri;
    }

    isURIResource(): boolean {
        return true;
    };

    getBaseURI() {
        if (this.uri.lastIndexOf("#") > -1) {
            return this.uri.substring(0, this.uri.lastIndexOf("#") + 1);
        } else {
            return this.uri.substring(0, this.uri.lastIndexOf("/") + 1);
        }
    }

    getLocalName() {
        if (this.uri.lastIndexOf("#") > -1) {
            return this.uri.substring(this.uri.lastIndexOf("#") + 1);
        } else {
            return this.uri.substring(this.uri.lastIndexOf("/") + 1);
        }
    }

    getNominalValue(): string {
        return this.uri;
    };

    toNT(): string {
        return "<" + this.uri + ">";
    };

    clone(): ARTURIResource {
        let cloneRes = new ARTURIResource(this.uri, this.show, this.role);
        let props: string[] = Object.getOwnPropertyNames(this);
        for (var i = 0; i < props.length; i++) {
            cloneRes[props[i]] = this[props[i]];
        }
        return cloneRes;
    }

}

export class ARTBNode extends ARTResource {
    private id: string;

    constructor(id: string, show?: string, role?: RDFResourceRolesEnum) {
        super(show, role);
        this.id = id;
    }

    setId(id: string) {
        this.id = id;
    }
    getId(): string {
        return this.id;
    }

    isBNode(): boolean {
        return true;
    };

    getNominalValue(): string {
        return this.id;
    };

    toNT(): string {
        return this.getNominalValue();
    };

    clone(): ARTBNode {
        let cloneRes = new ARTBNode(this.id, this.show, this.role);
        let props: string[] = Object.getOwnPropertyNames(this);
        for (var i = 0; i < props.length; i++) {
            cloneRes[props[i]] = this[props[i]];
        }
        return cloneRes;
    }

}

export class ARTLiteral extends ARTNode {
    private value: string;
    private datatype: string;
    private lang: string;

    constructor(value: string, datatype?: string, lang?: string) {
        super();
        this.value = value;
        this.datatype = datatype;
        this.lang = lang;
    }

    setValue(value: string) {
        this.value = value;
    }
    getValue(): string {
        return this.value;
    };

    setDatatype(datatype: string) {
        this.datatype = datatype;
    }
    getDatatype(): string {
        return this.datatype;
    };

    setLang(lang: string) {
        this.lang = lang;
    }
    getLang(): string {
        return this.lang;
    };

    isLiteral(): boolean {
        return true;
    };

    isTypedLiteral(): boolean {
        return this.datatype != null;
    };

    getNominalValue(): string {
        return this.toNT();
    };

    getShow(): string {
        return this.value;
    }

    toNT(): string {
        var nt = JSON.stringify(this.value);
        if (this.lang != null && this.lang.length > 0) {
            nt += "@" + this.lang;
        } else if (this.datatype != null && this.datatype != "") {
            nt += "^^<" + this.datatype + ">";
        }
        return nt;
    };

    clone(): ARTLiteral {
        let cloneRes = new ARTLiteral(this.value);
        let props: string[] = Object.getOwnPropertyNames(this);
        for (var i = 0; i < props.length; i++) {
            cloneRes[props[i]] = this[props[i]];
        }
        return cloneRes;
    }

}

export class ARTPredicateObjects {
    private predicate: ARTURIResource;
    private objects: ARTNode[];

    constructor(predicate: ARTURIResource, objects: ARTNode[]) {
        this.predicate = predicate;
        this.objects = objects;
    }

    getPredicate(): ARTURIResource {
        return this.predicate;
    };

    getObjects(): ARTNode[] {
        return this.objects;
    };
}

export class ResAttribute {

    public static SHOW = "show";
    public static QNAME = "qname";
    public static ROLE = "role";
    public static EXPLICIT = "explicit";
    public static MORE = "more";
    public static NUM_INST = "numInst";
    public static HAS_CUSTOM_RANGE = "hasCustomRange";
    public static RESOURCE_POSITION = "resourcePosition";
    public static LANG = "lang";
    public static GRAPHS = "graphs"; //used in getResourceView response
    public static MEMBERS = "members"; //used for ordered collections
    public static INDEX = "index"; //used for members of ordered collections
    public static IN_SCHEME = "inScheme"; //used only in Skos.getSchemesMatrixPerConcept()
    public static NATURE = "nature"; //content is a triple separated by "-": <uri of class of resource> - <graph of ???> - <deprecated true/false>
    public static SCHEMES = "schemes"; //attribute of concepts in searchResource response

    //never in st responses, result of nature parsing
    public static DEPRECATED = "deprecated";

    //never in st responses, added because are useful for tree
    public static CHILDREN = "children"; //stores an array of children resources
    public static SELECTED = "selected"; //if true, render the node as selected
    public static NEW = "new"; //if true, the resource is made visible after the treeNodeComponent is initialized

    //useful in ResourceView to render potentially reified resource as not reified
    public static NOT_REIFIED = "notReified";//

}

export enum RDFResourceRolesEnum {
    annotationProperty = "annotationProperty",
    cls = "cls",
    concept = "concept",
    conceptScheme = "conceptScheme",
    dataRange = "dataRange",
    datatypeProperty = "datatypeProperty",
    individual = "individual",
    mention = "mention",
    objectProperty = "objectProperty",
    ontology = "ontology",
    ontologyProperty = "ontologyProperty",
    property = "property",
    undetermined = "undetermined",
    xLabel = "xLabel",
    skosCollection = "skosCollection",
    skosOrderedCollection = "skosOrderedCollection",
    limeLexicon = "limeLexicon",
    ontolexLexicalEntry = "ontolexLexicalEntry",
    ontolexLexicalSense = "ontolexLexicalSense",
    ontolexForm = "ontolexForm"
}

export enum RDFTypesEnum {
    bnode = "bnode",
    literal = "literal",
    plainLiteral = "plainLiteral",
    resource = "resource",
    typedLiteral = "typedLiteral",
    undetermined = "undetermined",
    uri = "uri"
}

export enum SortAttribute {
    value = "value",
    show = "show"
}

export class ResourceUtils {

    /**
     * Sort an Array of ARTResource by the given attribute.
     * @param list 
     * @param attribute
     */
    static sortResources(list: ARTNode[], attribute: SortAttribute) {
        //sort by show
        if (attribute == SortAttribute.show) {
            list.sort(
                function (r1: ARTNode, r2: ARTNode) {
                    return r1.getShow().toLowerCase().localeCompare(r2.getShow().toLowerCase());
                }
            );
        }
        if (attribute == SortAttribute.value) {
            list.sort(
                function (r1: ARTNode, r2: ARTNode) {
                    return r1.getNominalValue().localeCompare(r2.getNominalValue());
                }
            );
        }
    }

    /**
     * Tells if a list contains a given node
     */
    static containsNode(list: ARTNode[], node: ARTNode): boolean {
        return this.indexOfNode(list, node) != -1;
        // for (var i = 0; i < list.length; i++) {
        //     if (list[i].getNominalValue() == node.getNominalValue()) {
        //         return true;
        //     }
        // }
        // return false;
    }

    static indexOfNode(list: ARTNode[], node: ARTNode): number {
        for (var i = 0; i < list.length; i++) {
            if (list[i].getNominalValue() == node.getNominalValue()) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Returns the rendering of a resource.
     * If rendering is true, returns the show of the resource.
     * If rendering is false, if the resource is a URI resource, reuturns its qname (if not available, the whole uri), if the
     * resource isn't a URI resource, returns the show.
     * @param resource 
     * @param rendering 
     */
    static getRendering(resource: ARTNode, rendering: boolean) {
        if (rendering) {
            return resource.getShow();
        } else {
            if (resource.isURIResource()) {
                let qname = resource.getAdditionalProperty(ResAttribute.QNAME);
                if (qname != undefined) {
                    return qname;
                } else {
                    return (<ARTURIResource>resource).getURI();
                }
            } else {
                return resource.getShow();
            }
        }
    }

    /**
     * Given an NT serialization of a URI, creates and returns an ARTURIResource object.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseURI()
     * @param nTriplesURI 
     */
    static parseURI(nTriplesURI: string): ARTURIResource {
        if (nTriplesURI.startsWith("<") && nTriplesURI.endsWith(">")) {
            let uri: string = nTriplesURI.substring(1, nTriplesURI.length - 1);
            uri = decodeURI(uri);
            return new ARTURIResource(uri);
        }
        else {
            throw new Error("Not a legal N-Triples URI: " + nTriplesURI);
        }
    }

    /**
     * Given an NT serialization of a literal, creates and returns an ARTLiteral object.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseLiteral()
     * @param nTriplesLiteral
     */
    static parseLiteral(nTriplesLiteral: string): ARTLiteral {
        if (nTriplesLiteral.startsWith("\"")) {
            // Find string separation points
            let endLabelIdx: number = this.findEndOfLabel(nTriplesLiteral);

            if (endLabelIdx != -1) {
                let startLangIdx: number = nTriplesLiteral.indexOf("@", endLabelIdx);
                let startDtIdx: number = nTriplesLiteral.indexOf("^^", endLabelIdx);

                if (startLangIdx != -1 && startDtIdx != -1) {
                    throw new Error("Literals can not have both a language and a datatype");
                }

                // Get label
                let label: string = nTriplesLiteral.substring(1, endLabelIdx);
                label = label.replace(/\\"/g, '"');

                if (startLangIdx != -1) {
                    // Get language
                    let language: string = nTriplesLiteral.substring(startLangIdx + 1);
                    return new ARTLiteral(label, null, language);
                }
                else if (startDtIdx != -1) {
                    // Get datatype
                    let datatype: string = nTriplesLiteral.substring(startDtIdx + 2);
                    let dtURI: ARTURIResource = this.parseURI(datatype);
                    return new ARTLiteral(label, dtURI.getURI());
                }
                else {
                    return new ARTLiteral(label);
                }
            }
        }
        throw new Error("Not a legal N-Triples literal: " + nTriplesLiteral);
    }

    /**
	 * Finds the end of the label in a literal string. This method takes into account that characters can be
	 * escaped using backslashes.
     * Code inspired by org.eclipse.rdf4j.rio.ntriples.NTripleUtils#parseLiteral()
     * 
	 * @return The index of the double quote ending the label, or <tt>-1</tt> if it could not be found.
	 */
    private static findEndOfLabel(nTriplesLiteral: string): number {
        // First character of literal is guaranteed to be a double
        // quote, start search at second character.
        let previousWasBackslash: boolean = false;
        for (var i = 1; i < nTriplesLiteral.length; i++) {
            let c: string = nTriplesLiteral.charAt(i);
            if (c == '"' && !previousWasBackslash) {
                return i;
            }
            else if (c == '\\' && !previousWasBackslash) {
                previousWasBackslash = true; // start of escape
            }
            else if (previousWasBackslash) {
                previousWasBackslash = false; // c was escaped
            }
        }
        return -1;
    }

    static parseBNode(nTriplesBNode: string): ARTBNode {
        if (nTriplesBNode.startsWith("_:")) {
            return new ARTBNode(nTriplesBNode);
        } else {
            throw new Error("Not a legal N-Triples Blank Node: " + nTriplesBNode);
        }
    }

    static isQName(nTripleQName: string, prefixMapping: PrefixMapping[]): boolean {
        let colonIdx: number = nTripleQName.indexOf(":");
        if (colonIdx != -1) {
            if (nTripleQName.includes(" ")) { //QName cannot contains whitespace (nTripleQName could represent a manch expr)
                return false;
            }
            let prefix: string = nTripleQName.substring(0, colonIdx);
            for (var i = 0; i < prefixMapping.length; i++) {
                if (prefixMapping[i].prefix == prefix) {
                    return true;
                }
            }
        }
        return false;
    }

    static parseQName(nTripleQName: string, prefixMapping: PrefixMapping[]): ARTURIResource {
        let colonIdx: number = nTripleQName.indexOf(":");
        if (colonIdx != -1) {
            let prefix: string = nTripleQName.substring(0, colonIdx);
            let localName: string = nTripleQName.substring(colonIdx + 1);
            //resolve prefix
            let namespace: string;
            for (var i = 0; i < prefixMapping.length; i++) {
                if (prefixMapping[i].prefix == prefix) {
                    return new ARTURIResource(prefixMapping[i].namespace + localName);
                }
            }
        } else {
            throw new Error("Not a legal N-Triples QName: " + nTripleQName);
        }
    }

    /**
     * Returns the qname of a IRI if the prefix-namespace is found, null otherwise
     * @param resource
     * @param prefixMapping 
     */
    static getQName(iri: string, prefixMapping: PrefixMapping[]): string {
        for (var i = 0; i < prefixMapping.length; i++) {
            if (iri.startsWith(prefixMapping[i].namespace)) {
                return iri.replace(prefixMapping[i].namespace, prefixMapping[i].prefix + ":");
            }
        }
        return null;
    }

    /**
     * Returns true if the resource is in the staging (add or remove) graph, false otherwise
     * @param resource 
     */
    static isReourceInStaging(resource: ARTResource): boolean {
        let graphs: ARTURIResource[] = resource.getGraphs();
        for (var i = 0; i < graphs.length; i++) {
            //I can't figure out why cannot use SemanticTurkey.stagingAddGraph here (error "cannot read 'cls' of undefined")
            // if (graphs[i].getURI() == SemanticTurkey.stagingAddGraph || graphs[i].getURI() == SemanticTurkey.stagingRemoveGraph) {
            if (graphs[i].getURI().startsWith("http://semanticturkey.uniroma2.it/ns/validation#staging-add-graph/") ||
                graphs[i].getURI().startsWith("http://semanticturkey.uniroma2.it/ns/validation#staging-remove-graph/")) {
                return true;
            }
        }
        return false;
    }

    /**
     * Taken from it.uniroma2.art.semanticturkey.data.role.RDFResourceRoles
     * @param subsumer 
     * @param subsumee 
     * @param undeterminedSubsumeesAll 
     */
    static roleSubsumes(subsumer: RDFResourceRolesEnum, subsumee: RDFResourceRolesEnum, undeterminedSubsumeesAll?: boolean) {
        if (subsumer == subsumee) {
            return true;
        }
        if (subsumer == RDFResourceRolesEnum.undetermined && undeterminedSubsumeesAll) {
            return true;
        }
        if (subsumer == RDFResourceRolesEnum.property) {
            return subsumee == RDFResourceRolesEnum.objectProperty || subsumee == RDFResourceRolesEnum.datatypeProperty
                || subsumee == RDFResourceRolesEnum.annotationProperty || subsumee == RDFResourceRolesEnum.ontologyProperty;
        }
        if (subsumer == RDFResourceRolesEnum.skosCollection && subsumee == RDFResourceRolesEnum.skosOrderedCollection) {
            return true;
        }
        return false;
    }

}