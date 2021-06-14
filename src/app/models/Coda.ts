import { ResourceUtils } from "../utils/ResourceUtils";
import { ARTNode } from "./ARTResources";
import { PrefixMapping } from "./Metadata";

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

    /**
     * Tells if the converter is compliant with the required capability
     * @param capability 
     * @returns 
     */
    public isCapabilityCompliant(capability: RDFCapabilityType): boolean {
        if (this.rdfCapability == capability) {
            return true;
        } else if (this.rdfCapability == RDFCapabilityType.node) { //node is compliant with both uri and node
            return true;
        }
        return false;
    }

    static parse(descrJson: any): ConverterContractDescription {
        let signatures: SignatureDescription[] = [];
        let signaturesArrayObj = descrJson.signatures;
        for (let j = 0; j < signaturesArrayObj.length; j++) {
            let signatureObj = signaturesArrayObj[j];
            signatures.push(SignatureDescription.parse(signatureObj));
        }
        //sort signatures according the parameters length
        signatures.sort((s1: SignatureDescription, s2: SignatureDescription) => {
            if (s1.getParameters().length < s2.getParameters().length) return -1;
            if (s1.getParameters().length > s2.getParameters().length) return 1;
            return 0;
        });
        let converter: ConverterContractDescription = new ConverterContractDescription(
            descrJson.uri, descrJson.name, descrJson.description,
            descrJson.rdfCapability, descrJson.datatypes, signatures);
        return converter;
    }
}

export class ConverterUtils {

    /**
     * 
     * @param converter 
     * @param signature chosen signature description of the converter. Contains the parameters
     * @param capabilityType disambiguate the capability type of those converter which the capability is node (so converter could be uri or literal)
     * @returns 
     */
    public static getConverterProjectionOperator(converter: ConverterContractDescription, signature?: SignatureDescription,
            capabilityType?: RDFCapabilityType, paramsValueMap?: {[key: string]: any}, language?: string, datatypeIri?: string, prefixMapping?: PrefixMapping[]): string {
        let projectionOperator: string = "";
        let uriOrLiteral = RDFCapabilityType.literal;
        if (converter.getRDFCapability() == RDFCapabilityType.uri || converter.getRDFCapability() == RDFCapabilityType.node && capabilityType == RDFCapabilityType.uri) {
            uriOrLiteral = RDFCapabilityType.uri;
        }
        projectionOperator += uriOrLiteral;
        if (converter.getURI() == ConverterContractDescription.NAMESPACE + "default") {
            //default converter doesn't need to be specified explicitly and doesn't have parameters
            //just add eventually, in case of literal converter, language or datatype
            if (uriOrLiteral == RDFCapabilityType.literal) {
                if (language != null) {
                    projectionOperator += "@" + language;
                } else if (datatypeIri != null) {
                    let dtQname = ResourceUtils.getQName(datatypeIri, prefixMapping);
                    if (dtQname == datatypeIri) { //qname not resolved => serialize datatype as IRI in NT format
                        projectionOperator += "^^<" + datatypeIri + ">";
                    } else {
                        projectionOperator += "^^" + dtQname;
                    }
                }
            }
        } else {
            //for other converter specify URI and parameters (if any)
            let convQName = converter.getURI().replace(ConverterContractDescription.NAMESPACE, ConverterContractDescription.PREFIX + ":");
            projectionOperator += "(" + convQName + "(";
            //converter params
            if (signature != null) {
                projectionOperator += this.serializeConverterParams(signature, paramsValueMap);
            }
            projectionOperator += "))";
        }
        return projectionOperator;
    }

    /**
     * Serializes the parameters of the converter. If paramsValueMap is provided serializes also the values, otherwise
     * serialize the converter parameters as placeholders
     * @param signature 
     * @param paramsValueMap 
     * @returns 
     */
    private static serializeConverterParams(signature: SignatureDescription, paramsValueMap?: {[key: string]: any}): string {
        let params: string = "";
        if (signature != null) {
            let signatureParams: ParameterDescription[] = signature.getParameters();
            let paramsSerializations: string[] = [];
            if (paramsValueMap == null) { //serialize the parameters as placeholder
                signatureParams.forEach(sp => {
                    if (sp.getType().startsWith("java.util.Map")) {
                        paramsSerializations.push("{ key = \"value\"}");
                    } else if (sp.getType().endsWith("[]")) {
                        paramsSerializations.push("\"" + sp.getName() + "1\", \"" + sp.getName() + "2\"");
                    } else {
                        paramsSerializations.push("\"" + sp.getName() + "\"");
                    }
                })
            } else { //serialize the actual parameters
                signatureParams.forEach(sp => {
                    if (sp.getType().startsWith("java.util.Map")) {
                        let mapValue: {[key: string]:any} = paramsValueMap[sp.getName()];
                        let mapSerialization: {[key: string]:string} = {};
                        //transform the map<string,any> to map<string,string>
                        for (let key in mapValue) {
                            let v: any = mapValue[key];
                            //handled types for value of the map are: string, ARTNode
                            if (v instanceof ARTNode) {
                                mapSerialization[key] = v.toNT();
                            } else { //plain string or unhandled type
                                mapSerialization[key] = JSON.stringify(v);
                            }
                        }
                        paramsSerializations.push(JSON.stringify(mapSerialization));
                    } else if (sp.getType().endsWith("[]")) {
                        let listValue: any[] = paramsValueMap[sp.getName()];
                        let listSerialization: string[] = [];
                        for (let v of listValue) {
                            //handled types for value of the list are: string, ARTNode
                            if (v instanceof ARTNode) {
                                listSerialization.push(v.toNT());
                            } else { //plain string or unhandled type
                                listSerialization.push(JSON.stringify(v));
                            }
                        }
                        paramsSerializations.push(listSerialization.join(", "));
                    } else {
                        let value: any = paramsValueMap[sp.getName()];
                        if (typeof value == "string" && value.startsWith("$")) { //in case of node reference, serialize it as it is
                            paramsSerializations.push(value);
                        } else { //otherwise serialize it as json
                            paramsSerializations.push(JSON.stringify(value));
                        }
                    }
                })
            }
            params = paramsSerializations.join(", ");
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
    private params: ParameterDescription[];
    
    constructor(returnType: string, featurePathRequiredLevel: RequirementLevels, parameters: ParameterDescription[]) {
        this.returnType = returnType;
        this.featurePathRequiredLevel = featurePathRequiredLevel;
        this.params = parameters;
    }
    
    public getReturnType(): string {
        return this.returnType;
    }
    public getRequirementLevels(): RequirementLevels {
        return this.featurePathRequiredLevel;
    }
    public getParameters(): ParameterDescription[] {
        return this.params;
    }

    static parse(descr: any): SignatureDescription {
        let parameters: ParameterDescription[] = [];
        let parametersArrayObj = descr.params;
        for (let k = 0; k < parametersArrayObj.length; k++) {
            let paramObj = parametersArrayObj[k];
            parameters.push(new ParameterDescription(paramObj.name, paramObj.type, paramObj.description));
        }
        let signature = new SignatureDescription(descr.returnType, descr.featurePathRequiredLevel, parameters);
        return signature;
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
