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
    getRole(): string;
}

export class ARTURIResource implements ARTResource {
    public uri: string;
    public show: string;
    public role: string;

    constructor(uri: string, show: string, role: string) {
        this.uri = uri;
        this.show = show;
        this.role = role;
    }

    getURI(): string {
        return this.uri;
    }

    getRole(): string {
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
    public id: string;
    public show: string;
    public role: string;

    constructor(id: string, show: string, role: string) {
        this.id = id;
        this.show = show;
        this.role = role;
    }

    getId(): string {
        return this.id;
    }

    getRole(): string {
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
    public label: string;
    public datatype: string;
    public lang: string;
    public typedLiteral: boolean

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
        } else if (this.datatype != null) {
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

    public predicate: ARTURIResource;
    public objects;

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