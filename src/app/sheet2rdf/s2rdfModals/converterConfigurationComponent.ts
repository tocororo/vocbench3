import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTURIResource } from "../../models/ARTResources";
import { ConverterContractDescription, ParameterDescription, RDFCapabilityType, SignatureDescription, XRole } from "../../models/Coda";
import { CODAConverter } from "../../models/Sheet2RDF";
import { CODAServices } from "../../services/codaServices";
import { RangeType } from "../../services/propertyServices";


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
    private signatureParams: { name: string, value: any, type: string }[];

    private xRoles: string[] = [XRole.concept, XRole.conceptScheme, XRole.skosCollection, XRole.xLabel, XRole.xNote];
    
    constructor(private codaService: CODAServices) {}

    ngOnInit() {
        this.codaService.listConverterContracts().subscribe(
            converters => {
                converters.forEach(c => {
                    //check converter capability compatibility
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
                        if (this.converter.xRole != null) {
                            converterParams.push(this.converter.xRole);
                        }
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
                                this.signatureParams[paramName] = this.converter.params[paramName];
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
            this.selectSignature = null;
        } else {
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

    private getSignatureShow(signature: SignatureDescription): string {
        if (signature.getParameters().length == 0) {
            return "No params";
        } else {
            let show: string = "";
            signature.getParameters().forEach(p => {
                show += p.getName() + ", ";
            });
            show = show.substring(0, show.length-2); //removes the trailing ", "
            return show;
        }
    }

    private selectSignature(signature: SignatureDescription) {
        this.selectedSignature = signature;
        this.signatureParams = [];
        this.selectedSignature.getParameters().forEach(p => {
            this.signatureParams.push({ name: p.getName(), value: null, type: p.getType() });
        });
        this.emitStatusUpdate();
    }

    private onSignatureParamChange() {
        this.emitStatusUpdate();
    }


    private emitStatusUpdate() {
        let params: { [key: string]: string } = {};
        let xRole: string;
        this.signatureParams.forEach(p => {
            /**
             * The following is a (temporarly) workaround in order to "emit" an incomplete configuration when the xRole is not set.
             * The component that uses the converter-config, should control that the provided converter configuration is ok.
             * This check is performed simply by verifying that all the parameters in the returned converter.params are not null.
             * If the xRole is provided separately, it is excluded from the check (I cannot neither check it separately,
             * because from the parent component I don't know whether the chosen converter requires the xRole).
             * So, as a workaround, if the xRole is set, it is passed separately, otherwise, if not set, it is set as null parameter in the
             * params object (and thus the configuration results incomplete).
             * I should work on a better solution.
             */
            if (p.name == "xRole" && p.value != null) {
                xRole = p.value;
            } else {
                params[p.name] = p.value;
            }
        });
        let c: CODAConverter = {
            capability: (this.rangeType == RangeType.resource) ? RDFCapabilityType.uri : RDFCapabilityType.literal,
            contract: this.selectedConverter.getURI(),
            language: this.language,
            datatype: (this.datatype != null) ? this.datatype.getURI() : null,
            params: params,
            xRole: <XRole>xRole
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