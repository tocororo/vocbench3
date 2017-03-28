import { PrefixMapping } from "./PrefixMapping";

export interface ARTNode {
    isResource(): boolean;
    isURIResource(): boolean;
    isLiteral(): boolean;
    isBNode(): boolean;
    getNominalValue(): string;
    getShow(): string;
    toNT(): string;
    setAdditionalProperty(propName: string, propValue: any): void;
    deleteAdditionalProperty(propName: string): void;
    getAdditionalProperty(propName: string): any;
    clone(): ARTNode;
}

export interface ARTResource extends ARTNode {
    getRole(): RDFResourceRolesEnum;
}

export class ARTURIResource implements ARTResource {
    private uri: string;
    private show: string;
    private role: RDFResourceRolesEnum = RDFResourceRolesEnum.individual;

    constructor(uri: string, show?: string, role?: RDFResourceRolesEnum) {
        this.uri = uri;
        this.show = show;
        if (role != null) { this.role = role; }
    }

    setURI(uri: string) {
        this.uri = uri;
    }
    getURI(): string {
        return this.uri;
    }

    setRole(role: RDFResourceRolesEnum) {
        this.role = role;
    }
    getRole(): RDFResourceRolesEnum {
        return this.role;
    }

    isResource(): boolean {
        return true;
    };

    isURIResource(): boolean {
        return true;
    };

    isLiteral(): boolean {
        return false;
    }

    isBNode(): boolean {
        return false;
    }
    
    getBaseURI() {
        if (this.uri.lastIndexOf("#") > -1) {
            return this.uri.substring(0, this.uri.lastIndexOf("#")+1);
        } else {
            return this.uri.substring(0, this.uri.lastIndexOf("/")+1);
        }
    }
    
    getLocalName() {
        if (this.uri.lastIndexOf("#") > -1) {
            return this.uri.substring(this.uri.lastIndexOf("#")+1);
        } else {
            return this.uri.substring(this.uri.lastIndexOf("/")+1);
        }
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

    getNominalValue(): string {
        return this.uri;
    };

    toNT(): string {
        return "<" + this.uri + ">";
    };

    setAdditionalProperty(propName: string, propValue: any): void {
        this[propName] = propValue;
    }

    deleteAdditionalProperty(propName: string) {
        delete this[propName];
    }

    getAdditionalProperty(propName: string) {
        return this[propName];
    }

    clone(): ARTURIResource {
        let cloneRes = new ARTURIResource(this.uri, this.show, this.role);
        let props: string[] = Object.getOwnPropertyNames(this);
        for (var i = 0; i < props.length; i++) {
            cloneRes[props[i]] = this[props[i]];
        }
        return cloneRes;
    }

}

export class ARTBNode implements ARTResource {
    private id: string;
    private show: string;
    private role: RDFResourceRolesEnum = RDFResourceRolesEnum.individual;

    constructor(id: string, show?: string, role?: RDFResourceRolesEnum) {
        this.id = id;
        this.show = show;
        if (role != null) { this.role = role; }
    }

    setId(id: string) {
        this.id = id;
    }
    getId(): string {
        return this.id;
    }

    setRole(role: RDFResourceRolesEnum) {
        this.role = role;
    }
    getRole(): RDFResourceRolesEnum {
        return this.role;
    }

    isResource(): boolean {
        return true;
    };

    isURIResource(): boolean {
        return false;
    };

    isLiteral(): boolean {
        return false;
    };

    isBNode(): boolean {
        return true;
    };

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

    getNominalValue(): string {
        return this.id;
    };

    toNT(): string {
        return this.getNominalValue();
    };

    setAdditionalProperty(propName: string, propValue: any): void {
        this[propName] = propValue;
    }

    deleteAdditionalProperty(propName: string) {
        delete this[propName];
    }

    getAdditionalProperty(propName: string) {
        return this[propName];
    }

    clone(): ARTBNode {
        let cloneRes = new ARTBNode(this.id, this.show, this.role);
        let props: string[] = Object.getOwnPropertyNames(this);
        for (var i = 0; i < props.length; i++) {
            cloneRes[props[i]] = this[props[i]];
        }
        return cloneRes;
    }

}

export class ARTLiteral implements ARTNode {
    private value: string;
    private datatype: string;
    private lang: string;

    constructor(value: string, datatype?: string, lang?: string) {
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

    isResource(): boolean {
        return false;
    };

    isURIResource(): boolean {
        return false;
    };

    isLiteral(): boolean {
        return true;
    };

    isTypedLiteral(): boolean {
        return this.datatype != null;
    };

    isBNode(): boolean {
        return false;
    }

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
            nt += "^^" + this.datatype;
        }
        return nt;
    };

    setAdditionalProperty(propName: string, propValue: any): void {
        this[propName] = propValue;
    }

    deleteAdditionalProperty(propName: string): void {
        delete this[propName];
    }

    getAdditionalProperty(propName: string): any {
        return this[propName];
    }

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
    public static TYPE = "type";
    public static EXPLICIT = "explicit";
    public static MORE = "more";
    public static NUM_INST = "numInst";
    public static HAS_CUSTOM_RANGE = "hasCustomRange";
    public static RESOURCE_POSITION = "resourcePosition";
    public static LANG = "lang";
    public static GRAPHS = "graphs"; //used in getResourceView response
    public static MEMBERS = "members"; //used for ordered collections
    public static INDEX = "index"; //used for members of ordered collections
    
    //never in st responses, added because are util for tree
    public static OPEN = "open";
    public static CHILDREN = "children";
    public static SELECTED = "selected";
    
}


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
    "xLabel"|
    "skosCollection" |
    "skosOrderedCollection";
    
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
    xLabel: "xLabel" as RDFResourceRolesEnum,
    skosCollection: "skosCollection" as RDFResourceRolesEnum,
    skosOrderedCollection: "skosOrderedCollection" as RDFResourceRolesEnum
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



export class ResourceUtils {

    /**
     * Sort an Array of ARTResource by the given attribute.
     * @param list 
     * @param attribute
     */
    static sortResources(list: ARTResource[], attribute: "value" | "show") {
        //sort by show
        if (attribute == "show") {
            list.sort(
                function (r1: ARTResource, r2: ARTResource) {
                    if (r1.getShow() > r2.getShow()) return 1;
                    if (r1.getShow() < r2.getShow()) return -1;
                    return 0;
                }
            );
        }
        if (attribute == "value") {
            list.sort(
                function (r1: ARTResource, r2: ARTResource) {
                    if (r1.getNominalValue() > r2.getNominalValue()) return 1;
                    if (r1.getNominalValue() < r2.getNominalValue()) return -1;
                    return 0;
                }
            );
        }
    }

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
     * Given an NT serialization of a literal, creates and returns an ARTLiteral object
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
                    return new ARTLiteral(label, datatype);
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
        console.log("prefMap", prefixMapping);
        let colonIdx: number = nTripleQName.indexOf(":");
        if (colonIdx != -1) {
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
            let localName: string = nTripleQName.substring(colonIdx+1);
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

}