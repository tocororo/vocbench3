import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTURIResource } from "../../../models/ARTResources";
import { ConverterContractDescription, RDFCapabilityType, SignatureDescription, XRole } from "../../../models/Coda";
import { CODAConverter } from "../../../models/Sheet2RDF";
import { CODAServices } from "../../../services/codaServices";
import { RangeType } from "../../../services/propertyServices";


@Component({
    selector: "converter-config",
    templateUrl: "./converterConfigurationComponent.html"
})
export class ConverterConfigurationComponent {

    @Input() converter: CODAConverter;
    @Input() memoize: boolean;
    @Input() rangeType: RangeType; //the listed converters capability must be compliant with this rangeType
    @Input() language: string;
    @Input() datatype: ARTURIResource;
    @Output() update: EventEmitter<UpdateStatus> = new EventEmitter();

    private availableConverters: ConverterContractDescription[] = [];
    private selectedConverter: ConverterContractDescription;

    private availableSignatures: SignatureDescription[];
    private selectedSignature: SignatureDescription;
    private signatureParams: SignatureParam[];

    private xRoles: string[] = [XRole.concept, XRole.conceptScheme, XRole.skosCollection, XRole.xLabel, XRole.xNote];
    
    constructor(private codaService: CODAServices) {}

    ngOnInit() {
        this.codaService.listConverterContracts().subscribe(
            converters => {
                converters.forEach(c => {
                    // check converter capability compatibility
                    let capability: RDFCapabilityType = c.getRDFCapability();
                    if (this.rangeType == RangeType.resource) {
                        if (capability == RDFCapabilityType.node || capability == RDFCapabilityType.uri) {
                            this.availableConverters.push(c);
                        }
                    } else if (this.rangeType == RangeType.plainLiteral) {
                        if (capability == RDFCapabilityType.node || capability == RDFCapabilityType.literal) {
                            this.availableConverters.push(c);
                        }
                    } else if (this.rangeType == RangeType.typedLiteral) {
                        if (capability == RDFCapabilityType.node || capability == RDFCapabilityType.typedLiteral) {
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
                        if (c.getURI() == this.converter.contract) {
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
                        }
                    });
                }
            }
        );
    }

    private selectConverter(converter: ConverterContractDescription) {
        if (this.selectedConverter == converter) {
            this.selectedConverter = null;
            this.availableSignatures = null;
            this.selectedSignature = null;
        } else {
            console.log("select converter", converter);
            this.selectedConverter = converter;
            /**
             * Consider as available signatures, only those which the return type is compliant with the range type required:
             * - if range type is resource, accepted return types are IRI and value
             * - if range type is literal (plain or typed), accepted return type ir Literal
             */
            this.availableSignatures = [];
            this.selectedConverter.getSignatures().forEach(s => {
                let returnType: string = s.getReturnType();
                if (this.rangeType == RangeType.resource && (returnType.endsWith(".IRI") || returnType.endsWith(".Value"))) {
                    this.availableSignatures.push(s);
                } else if ((this.rangeType == RangeType.plainLiteral || this.rangeType == RangeType.typedLiteral) && returnType.endsWith(".Literal")) {
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

    private getSignatureShow(signature: SignatureDescription): string {
        if (signature.getParameters().length == 0) {
            return "No params";
        } else {
            return signature.getParameters().map(p => p.getName()).join(", ");
        }
    }

    private selectSignature(signature: SignatureDescription) {
        console.log("selecting signature", signature);
        this.selectedSignature = signature;
        this.signatureParams = [];
        this.selectedSignature.getParameters().forEach(p => {
            this.signatureParams.push({ name: p.getName(), value: null, type: p.getType() });
        });
        this.emitStatusUpdate();
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
        let c: CODAConverter = {
            capability: (this.rangeType == RangeType.resource) ? RDFCapabilityType.uri : RDFCapabilityType.literal,
            contract: this.selectedConverter.getURI(),
            language: this.language,
            datatype: (this.datatype != null) ? this.datatype.getURI() : null,
            params: params
        }
        let status: UpdateStatus = { converter: c, memoize: this.isConverterRandom() ? this.memoize : false };
        // console.log("emitting status", status);
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