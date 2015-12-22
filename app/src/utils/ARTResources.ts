export interface ARTNode {
	
	isResource(): boolean;
	isURIResource(): boolean;
	isLiteral(): boolean;
	isBNode(): boolean;
    getShow(): string;
	getNominalValue(): string;
	toNT(): string;
	
}

export class ARTURIResource implements ARTNode {
	public uri:string;
	public show:string;
	public rule:string;
	
	constructor(uri:string, show:string, rule:string) {
		this.uri = uri;
		this.show = show;
		this.rule = rule;
	}
	
	isResource = function() : boolean {
		return true;
	};
	
	isURIResource = function() : boolean {
		return true;
	};
    
	isLiteral = function() : boolean {
        return false;
    }
    
	isBNode() : boolean {
        return false;
    }
    
    getShow() : string {
        return this.show;
    }
    
	getNominalValue() : string {
		return this.uri;
	};
	
	toNT() : string {
		return "<" + this.uri + ">";
	};
	
}

export class ARTLiteral implements ARTNode {
	public label:string;
	public datatype:string;
	public lang:string;
	public isTypedLiteral:string
	
	constructor(label:string, datatype:string, lang:string, isTypedLiteral:string) {
		this.label = label;
		this.datatype = datatype;
		this.lang = lang;
		this.isTypedLiteral = isTypedLiteral;
	}
    
    isResource() : boolean {
		return false;
	};
	
	isURIResource() : boolean {
		return false;
	};
    
	isLiteral() : boolean {
		return true;
	};
    
    isBNode() : boolean {
        return false;
    }
    
    getShow() : string {
        return this.toNT();
    }
	
	getNominalValue() : string {
		return this.label;
	};
	
	toNT() : string {
		var nt = JSON.stringify(this.label);
		if (this.lang != null && this.lang.length > 0) {
			nt += "@" + this.lang;
		} else if (this.datatype != null) {
			nt += "^^" + this.datatype;
		}
		return nt;
	};
	
}

export class ARTBNode implements ARTNode {
	public id:string;
	public show:string;
	public role:string;
	
	constructor(id:string, show:string, role:string) {
		this.id = id;
		this.show = show;
		this.role = role;
	}
    
    isResource() : boolean {
		return false;
	};
	
	isURIResource() : boolean {
		return false;
	};
    
	isLiteral() : boolean {
		return false;
	};
    
	isBNode() : boolean {
		return true;
	};
    
    getShow() : string {
        return this.getNominalValue();
    }
	
	getNominalValue() : string {
		return "_:" + this.id;
	};
	
	toNT() : string {
		return this.getNominalValue();
	};
	
}