import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTURIResource } from "../../../models/ARTResources";
import { ConverterContractDescription, RDFCapabilityType, SignatureDescription, XRole } from "../../../models/Coda";
import { CODAConverter } from "../../../models/Sheet2RDF";
import { RDF } from "../../../models/Vocabulary";
import { CODAServices } from "../../../services/codaServices";
import { RangeType } from "../../../services/propertyServices";


@Component({
    selector: "converter-config",
    templateUrl: "./converterConfigurationComponent.html"
})
export class ConverterConfigurationComponent {

    @Input() converter: CODAConverter;
    @Input() memoize: boolean;
    @Input() rangeType: RangeType; //the listed converters capability must be compliant with this rangeType (if not provided, all converter are ok)
    @Input() language: string;
    @Input() datatype: ARTURIResource;
    @Output() update: EventEmitter<UpdateStatus> = new EventEmitter();

    private availableConverters: ConverterContractDescription[] = [];
    private selectedConverter: ConverterContractDescription;

    private availableSignatures: SignatureDescription[];
    private selectedSignature: SignatureDescription;
    private signatureParams: SignatureParam[];

    private readonly languageLiteralAspect: string = "language";
    private readonly datatypeLiteralAspect: string = "datatype";
    private literalAspectOpts: string[] = ["---", this.languageLiteralAspect, this.datatypeLiteralAspect];
    private selectedLiteralAspect: string = this.literalAspectOpts[0];
    private literalAspectChangeable: boolean = true;

    private xRoles: string[] = [XRole.concept, XRole.conceptScheme, XRole.skosCollection, XRole.xLabel, XRole.xNote];
    
    constructor(private codaService: CODAServices) {}

    ngOnInit() {
        if (this.language == null && this.converter != null) { //language not provided as input => get the language of the input converter
            this.language = this.converter.language;
        }
        if (this.language != null) {
            this.selectedLiteralAspect = this.languageLiteralAspect;
            this.literalAspectChangeable = false;
        } else if (this.datatype != null) {
            if (this.datatype.equals(RDF.langString)) {
                this.selectedLiteralAspect = this.languageLiteralAspect;
            } else {
                this.selectedLiteralAspect = this.datatypeLiteralAspect;
            }
            this.literalAspectChangeable = false;
        }

        this.codaService.listConverterContracts().subscribe(
            converters => {
                converters.forEach(c => {
                    // check converter capability compatibility
                    let capability: RDFCapabilityType = c.getRDFCapability();
                    if (this.rangeType == null) {
                        this.availableConverters.push(c);
                    } else if (this.rangeType == RangeType.resource) {
                        if (capability == RDFCapabilityType.node || capability == RDFCapabilityType.uri) {
                            this.availableConverters.push(c);
                        }
                    } else if (this.rangeType == RangeType.literal) {
                        if (capability == RDFCapabilityType.node || capability == RDFCapabilityType.literal) {
                            let datatypes = c.getDatatypes();
                            if (this.datatype != null && datatypes.length > 0) {
                                if (datatypes.indexOf(this.datatype.getURI()) != -1) { //datatype in the datatypes of the converter => the converter can produce the required dt
                                    this.availableConverters.push(c);        
                                }
                            } else {
                                this.availableConverters.push(c);
                            }
                        }
                    }
                });
                if (this.converter != null) {
                    //restore the selected converter
                    this.availableConverters.forEach(c => {
                        if (c.getURI() == this.converter.contractUri) {
                            this.selectConverter(c);
                        }
                    });
                    //restore the selected signature and the parameters
                    this.selectedConverter.getSignatures().forEach(s => {
                        //compare the names of the params
                        let signatureParams: string[] = s.getParameters().map(p => p.getName());
                        let converterParams: string[] = Object.keys(this.converter.params);
                        signatureParams.sort();
                        converterParams.sort();
                        if (signatureParams.length == converterParams.length) {
                            for (let i = 0; i < signatureParams.length; i++) {
                                if (signatureParams[i] != converterParams[i]) {
                                    return; //found a different parameter => this is not the used signature
                                }
                            }
                            //if this code is reached, every parameter of the signature was found in the converter => select the signature
                            this.selectSignature(s);
                            //now restore the values
                            for (let paramName in this.converter.params) {
                                this.signatureParams.find(p => p.name == paramName).value = this.converter.params[paramName];
                            }
                            this.emitStatusUpdate();
                        }
                    });
                }
            }
        );
    }

    private selectConverter(converter: ConverterContractDescription) {
        if (this.selectedConverter != converter) {
            this.selectedConverter = converter;
            /**
             * Consider as available signatures, only those which the return type is compliant with the range type required:
             * - if range type is resource, accepted return types are IRI and value
             * - if range type is literal (plain or typed), accepted return type ir Literal
             */
            this.availableSignatures = [];
            this.selectedConverter.getSignatures().forEach(s => {
                let returnType: string = s.getReturnType();
                if (this.rangeType == null) {
                    this.availableSignatures.push(s);
                } else if (this.rangeType == RangeType.resource && (returnType.endsWith(".IRI") || returnType.endsWith(".Value"))) {
                    this.availableSignatures.push(s);
                } else if ((this.rangeType == RangeType.literal) && returnType.endsWith(".Literal")) {
                    this.availableSignatures.push(s);
                }
            })
            this.selectSignature(this.availableSignatures[0]);
        }
        this.emitStatusUpdate();
    }

    private isConverterRandom() {
        return this.selectedConverter != null && this.selectedConverter.getURI() == ConverterContractDescription.NAMESPACE + "randIdGen";
    }

    private onMemoizeChange() {
        this.emitStatusUpdate();
    }

    /**
     * ========== Signature customization ==========
     */

    /**
     * check if the selected converter is the default one and if the selected signature is the literal one
     */
    private showDefaultLiteralConverterOpt() {
        return this.selectedConverter != null && this.selectedConverter.getURI() == ConverterContractDescription.NAMESPACE + "default" &&
            this.selectedSignature != null && this.selectedSignature.getReturnType().endsWith(".Literal");
    }

    private getSignatureShow(signature: SignatureDescription): string {
        return this.selectedConverter.getSerialization(signature);
    }

    private selectSignature(signature: SignatureDescription) {
        this.selectedSignature = signature;
        this.signatureParams = [];
        this.selectedSignature.getParameters().forEach(p => {
            this.signatureParams.push({ name: p.getName(), value: null, type: p.getType() });
        });
        this.emitStatusUpdate();
    }

    private getParameterTitle(parameter: SignatureParam): string {
        if (parameter.type == "java.lang.String") {
            return "String parameter";
        } else if (parameter.type == "org.eclipse.rdf4j.model.Value[]") {
            return "List of values. Each value can be the id of a node or an RDF value represented in NT serialization";
        } else if (parameter.type == "java.util.Map<java.lang.String, org.eclipse.rdf4j.model.Value>") {
            return "Key-value Map. Each value can be the id of a node or an RDF value represented in NT serialization";
        }
    }

    private onMapParamChange(value: {[key: string]:any}, p: SignatureParam) {
        p.value = value;
        this.emitStatusUpdate();
    }

    private onListParamChange(value: any[], p: SignatureParam) {
        p.value = value;
        this.emitStatusUpdate();
    }

    private onSignatureParamChange() {
        this.emitStatusUpdate();
    }

    /**
     * ========== ========== ========== ==========
     */

    private emitStatusUpdate() {
        let params: { [key: string]: any } = {};
        this.signatureParams.forEach(p => {
            let value;
            if (p.type == "java.lang.String") {
                value = p.value;
            } else if (p.type == "org.eclipse.rdf4j.model.Value") {
                if (p.value != null && p.value.trim() != "") {
                    value = new ARTLiteral(p.value);
                }
            } else if (p.type == "java.util.Map<java.lang.String, org.eclipse.rdf4j.model.Value>") {
                value = p.value;
            } else if (p.type == "org.eclipse.rdf4j.model.Value[]") {
                value = p.value;
            }
            params[p.name] = value;
        });
        let capability = this.selectedSignature.getReturnType().endsWith(".Literal") ? RDFCapabilityType.literal : RDFCapabilityType.uri;
        let lang: string;
        let datatypeUri: string;
        if (capability == RDFCapabilityType.literal && this.selectedConverter.getURI().endsWith("/default")) {
            if (this.selectedLiteralAspect == this.languageLiteralAspect) {
                lang = this.language;
            } else if (this.selectedLiteralAspect == this.datatypeLiteralAspect) {
                datatypeUri = this.datatype.getURI();
            }
        }
        let c: CODAConverter = {
            type: capability,
            contractUri: this.selectedConverter.getURI(),
            language: lang,
            datatypeUri: datatypeUri,
            datatypeCapability: (this.selectedConverter.getDatatypes().length > 0) ? this.selectedConverter.getDatatypes()[0] : null,
            params: params
        }
        let status: UpdateStatus = { converter: c, memoize: this.isConverterRandom() ? this.memoize : false };
        this.update.emit(status);
    }

}

class UpdateStatus {
    converter: CODAConverter;
    memoize: boolean;
}

class SignatureParam { 
    name: string;
    value: any;
    type: string;
}