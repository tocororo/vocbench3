import { RDFTypesEnum } from "./ARTResources";

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
    public getQName(): string {
        return this.uri.replace(ConverterContractDescription.NAMESPACE, ConverterContractDescription.PREFIX+":");
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
    /**
     * Returns the serialization of the converter with the given signature
     */
    public getSerialization(signature: SignatureDescription) {
        let serialization: string = "";
        serialization += signature.getReturnType().endsWith(".Literal") ? "literal" : "uri";
        if (this.uri != ConverterContractDescription.NAMESPACE + "default") { //if not the default converter, add the params
            serialization += "(";
            serialization += this.getQName();
            serialization += "(";
            serialization += signature.getParameters().map(p => p.getName()).join(", ");
            serialization += ")";
            serialization += ")";
        }
        return serialization;
    }
}

export class ConverterUtils {

    public static getConverterProjectionOperator(converter: ConverterContractDescription, signature?: SignatureDescription,
            capabilityType?: RDFCapabilityType): string {
        let projectionOperator: string = "";
        projectionOperator += (converter.getRDFCapability() == RDFCapabilityType.uri) ? RDFTypesEnum.uri : RDFTypesEnum.literal; //'uri' or 'literal'
        //default converter doesn't need to be specified explicitly
        if (converter.getURI() == ConverterContractDescription.NAMESPACE + "default") {
            return capabilityType;
        }
        let convQName = converter.getURI().replace(ConverterContractDescription.NAMESPACE, ConverterContractDescription.PREFIX + ":");
        projectionOperator += "(" + convQName + "(";
        //converter params
        if (signature != null) {
            projectionOperator += this.serializeConverterParams(signature);
        }
        projectionOperator += "))";
        return projectionOperator;
    }

    private static serializeConverterParams(signature: SignatureDescription): string {
        var params: string = "";
        if (signature != null) {
            var signatureParams: ParameterDescription[] = signature.getParameters();
            for (var i = 0; i < signatureParams.length; i++) {
                if (signatureParams[i].getType().startsWith("java.util.Map")) {
                    params += "{ key = \"value\"}, ";    
                } else { //java.lang.String
                    params += "\"" + signature.getParameters()[i].getName() + "\", ";
                }
            }
            params = params.slice(0, -2); //remove the final ', '
        }
        return params;
    }

    public static getConverterQName(converterUri: string): string {
        return converterUri.replace(ConverterContractDescription.NAMESPACE, ConverterContractDescription.PREFIX + ":");
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

export enum RDFCapabilityType {
    node = "node",
    uri = "uri",
    literal = "literal"
}

export enum RequirementLevels {
    REQUIRED = "REQUIRED",
    OPTIONAL = "OPTIONAL",
    IGNORED = "IGNORED"
}

export enum XRole {
    concept = "concept",
    conceptScheme = "conceptScheme",
    skosCollection = "skosCollection",
    xLabel = "xLabel",
    xNote = "xNote",
    undetermined = "undetermined"
}

export interface PearlValidationResult {
    valid: boolean;
    details?: string;
}