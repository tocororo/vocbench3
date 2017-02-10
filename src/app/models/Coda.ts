export class ConverterContractDescription {

    public static NAMESPACE = "http://art.uniroma2.it/coda/contracts/";
    public static PREFIX = "coda";

    private uri: string;
    private name: string;
    private description: string;
    private rdfCapability: RDFCapabilityType;
    private datatypes: string[];
    private signatures: SignatureDescription[];

    constructor(uri: string, name: string, description: string, rdfCapability: RDFCapabilityType, datatypes: string[], signatures: SignatureDescription[]) {
        this.uri = uri;
        this.name = name;
        this.description = description;
        this.rdfCapability = rdfCapability;
        this.datatypes = datatypes;
        this.signatures = signatures;
    }

    public getURI(): string {
        return this.uri;
    }
    public getName(): string {
        return this.name;
    }
    public getDescription(): string {
        return this.description;
    }
    public getRDFCapability(): RDFCapabilityType {
        return this.rdfCapability;
    }
    public getDatatypes(): string[] {
        return this.datatypes;
    }
    public getSignatures(): SignatureDescription[] {
        return this.signatures;
    }
}

export class SignatureDescription {
    
    private returnType: string;
    private featurePathRequiredLevel: RequirementLevels; //featurePath requirement level
    private parameters: ParameterDescription[];
    
    constructor(returnType: string, featurePathRequiredLevel: RequirementLevels, parameters: ParameterDescription[]) {
        this.returnType = returnType;
        this.featurePathRequiredLevel = featurePathRequiredLevel;
        this.parameters = parameters;
    }
    
    public getReturnType(): string {
        return this.returnType;
    }
    public getRequirementLevels(): RequirementLevels {
        return this.featurePathRequiredLevel;
    }
    public getParameters(): ParameterDescription[] {
        return this.parameters;
    }
}

export class ParameterDescription {
    
    private name: string;
    private type: string;
    private description: string;
    
    constructor(name: string, type: string, description: string) {
        this.name = name;
        this.type = type;
        this.description = description;
    }
    
    public getName(): string {
        return this.name;
    }
    public getType(): string {
        return this.type;
    }
    public getDescription(): string {
        return this.description;
    }
}

export type RDFCapabilityType = "node" | "uri" | "typedLiteral" | "literal";
export type RequirementLevels = "literal" | "uri";