import {RDFResourceRolesEnum} from "./Enums";

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
    private objects;

    constructor(predicate: ARTURIResource, objects) {
        this.predicate = predicate;
        this.objects = objects;
    }

    getPredicate(): ARTURIResource {
        return this.predicate;
    };

    getObjects() {
        return this.objects;
    };

}