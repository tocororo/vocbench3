export interface ARTNode {
    isResource(): boolean;
    isURIResource(): boolean;
    isLiteral(): boolean;
    isBNode(): boolean;
    getNominalValue(): string;
    getShow(): string;
    toNT(): string;
    setAdditionalProperty(propName: string, propValue): void;
    deleteAdditionalProperty(propName: string): void;
    getAdditionalProperty(propName: string): string;
}

export interface ARTResource extends ARTNode {
    getRole(): RDFResourceRolesEnum;
}

export class ARTURIResource implements ARTResource {
    private uri: string;
    private show: string;
    private role: RDFResourceRolesEnum;

    constructor(uri: string, show: string, role: RDFResourceRolesEnum) {
        this.uri = uri;
        this.show = show;
        this.role = role;
    }

    getURI(): string {
        return this.uri;
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

    getShow(): string {
        return this.show;
    }

    getNominalValue(): string {
        return this.uri;
    };

    toNT(): string {
        return "<" + this.uri + ">";
    };

    setAdditionalProperty(propName: string, propValue): void {
        this[propName] = propValue;
    }

    deleteAdditionalProperty(propName: string) {
        delete this[propName];
    }

    getAdditionalProperty(propName: string) {
        return this[propName];
    }

}

export class ARTBNode implements ARTResource {
    private id: string;
    private show: string;
    private role: RDFResourceRolesEnum;

    constructor(id: string, show: string, role: RDFResourceRolesEnum) {
        this.id = id;
        this.show = show;
        this.role = role;
    }

    getId(): string {
        return this.id;
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

    getShow(): string {
        return this.show;
    }

    getNominalValue(): string {
        return "_:" + this.id;
    };

    toNT(): string {
        return this.getNominalValue();
    };

    setAdditionalProperty(propName: string, propValue): void {
        this[propName] = propValue;
    }

    deleteAdditionalProperty(propName: string) {
        delete this[propName];
    }

    getAdditionalProperty(propName: string) {
        return this[propName];
    }

}

export class ARTLiteral implements ARTNode {
    private label: string;
    private datatype: string;
    private lang: string;
    private typedLiteral: boolean

    constructor(label: string, datatype: string, lang: string, typedLiteral: boolean) {
        this.label = label;
        this.datatype = datatype;
        this.lang = lang;
        this.typedLiteral = typedLiteral;
    }

    getLabel(): string {
        return this.label;
    };

    getDatatype(): string {
        return this.datatype;
    };

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
        return this.typedLiteral;
    };

    isBNode(): boolean {
        return false;
    }

    getNominalValue(): string {
        return this.label;
    };

    getShow(): string {
        return this.toNT();
    }

    toNT(): string {
        var nt = JSON.stringify(this.label);
        if (this.lang != null && this.lang.length > 0) {
            nt += "@" + this.lang;
        } else if (this.datatype != null && this.datatype != "") {
            nt += "^^" + this.datatype;
        }
        return nt;
    };

    setAdditionalProperty(propName: string, propValue): void {
        this[propName] = propValue;
    }

    deleteAdditionalProperty(propName: string) {
        delete this[propName];
    }

    getAdditionalProperty(propName: string) {
        return this[propName];
    }

}

export class ARTPredicateObjects {

    private predicate: ARTURIResource;
    private objects: ARTNode[];

    constructor(predicate: ARTURIResource, objects) {
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
    public static ROLE = "role";
    public static TYPE = "type";
    public static EXPLICIT = "explicit";
    public static MORE = "more";
    public static NUM_INST = "numInst";
    public static HAS_CUSTOM_RANGE = "hasCustomRange";
    public static RESOURCE_POSITION = "resourcePosition";
    public static LANG = "lang";
    public static GRAPHS = "graphs"; //used in getResourceView response
    
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