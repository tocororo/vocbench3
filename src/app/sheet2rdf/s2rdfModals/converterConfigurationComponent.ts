import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ConverterContractDescription, RDFCapabilityType } from "../../models/Coda";
import { CODAServices } from "../../services/codaServices";
import { CODAConverter } from "../../models/Sheet2RDF";
import { ARTURIResource } from "../../models/ARTResources";
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
                    this.availableConverters.forEach(c => {
                        if (c.getURI() == this.converter.contract) {
                            this.selectedConverter = c;
                        }
                    })
                }
            }
        );
    }

    private selectConverter(converter: ConverterContractDescription) {
        if (this.selectedConverter == converter) {
            this.selectedConverter = null;
        } else {
            this.selectedConverter = converter;
        }
        this.emitStatusUpdate();
    }

    private isConverterRandom() {
        return this.selectedConverter != null && this.selectedConverter.getURI() == ConverterContractDescription.NAMESPACE + "randIdGen";
    }

    private onMemoizeChange() {
        this.emitStatusUpdate();
    }

    private emitStatusUpdate() {
        let c: CODAConverter = {
            capability: (this.rangeType == RangeType.resource) ? RDFCapabilityType.uri : RDFCapabilityType.literal,
            contract: this.selectedConverter.getURI(),
            language: this.language,
            datatype: (this.datatype != null) ? this.datatype.getURI() : null,
            params: {},
            xRole: null
        }
        let status: UpdateStatus = { converter: c, memoize: this.isConverterRandom() ? this.memoize : false };
        console.log("emitting status", status);
        this.update.emit(status);
    }

}

class UpdateStatus {
    converter: CODAConverter;
    memoize: boolean;
}