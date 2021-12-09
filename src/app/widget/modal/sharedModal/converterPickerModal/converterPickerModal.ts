import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConverterContractDescription, ConverterUtils, RDFCapabilityType, SignatureDescription } from "../../../../models/Coda";
import { CODAServices } from "../../../../services/codaServices";
import { ModalOptions } from '../../Modals';
import { SignaturePickerModal } from "./signaturePickerModal";

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "converter-picker-modal",
    templateUrl: "./converterPickerModal.html",
})
export class ConverterPickerModal {
    @Input() title: string;
    @Input() message: string;
    @Input() capabilities: RDFCapabilityType[];
    
    converters: ConverterContractDescription[];
    selectedConverter: ConverterContractDescription;
    selectedConverterType: RDFCapabilityType; //uri/literal
    concerterTypeConstrained: boolean = false; //if true disable the selection of converter type (uri/literal) when available
    selectedSignature: SignatureDescription;

    projectionOperator: string = "";
    
    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private codaService: CODAServices) {}

    ngOnInit() {
        this.codaService.listConverterContracts().subscribe(
            converterList => {
                if (this.capabilities != null && this.capabilities.length != 0) {
                    if (this.capabilities.indexOf(RDFCapabilityType.node) != -1) {
                        this.converters = converterList;
                    } else {
                        //=> filter for capability, show only converters compliant with given capabilities
                        this.converters = [];
                        converterList.forEach((conv: ConverterContractDescription) => {
                            let capab: RDFCapabilityType = conv.getRDFCapability();
                            if (capab == RDFCapabilityType.node) {
                                this.converters.push(conv);
                            } else if (capab == RDFCapabilityType.uri) {
                                if (this.capabilities.indexOf(RDFCapabilityType.uri) != -1) {
                                    this.converters.push(conv);
                                }
                            } else if (capab == RDFCapabilityType.literal) {
                                if (this.capabilities.indexOf(RDFCapabilityType.literal) != -1) {
                                    this.converters.push(conv);
                                }
                            }
                        });
                    }
                } else {
                    //=> do not filter, show all converters
                    this.converters = converterList;
                }
            }
        );
        /**
         * selection of converter type constrained if:
         * allowed capabilities are only literal (no node or uri) => constrained to literal
         * allowed capabilities is only uri (no other capabilities) => constrained to uri
         */
        if (this.capabilities != null &&
            ((this.capabilities.length > 0 && this.capabilities.indexOf(RDFCapabilityType.node) == -1 && this.capabilities.indexOf(RDFCapabilityType.uri) == -1 ) ||
            (this.capabilities.length == 1 && this.capabilities[0] == RDFCapabilityType.uri))
         ) {
            this.concerterTypeConstrained = true;
        }
    }

    selectConverter(converter: ConverterContractDescription) {
        if (converter != this.selectedConverter) {
            this.selectedConverter = converter;
            if (this.selectedConverter.getRDFCapability() == RDFCapabilityType.literal ||
                (this.selectedConverter.getRDFCapability() == RDFCapabilityType.node && 
                this.capabilities != null && this.capabilities.length > 0 && 
                this.capabilities.indexOf(RDFCapabilityType.node) == -1 && this.capabilities.indexOf(RDFCapabilityType.uri) == -1)
            ) {
                this.selectedConverterType = RDFCapabilityType.literal;
            } else { //'node' or 'uri'
                this.selectedConverterType = RDFCapabilityType.uri;
            }
            //set as selected signature the one with less parameters
            let signatures = this.selectedConverter.getSignatures();
            this.selectedSignature = signatures[0];
            for (let i = 1; i < signatures.length; i++) {
                if (signatures[i].getParameters().length < this.selectedSignature.getParameters().length) {
                    this.selectedSignature = signatures[i];
                }
            }
            this.updateProjectionOperator();
        }
    }

    chooseSignature() {
        const modalRef: NgbModalRef = this.modalService.open(SignaturePickerModal, new ModalOptions());
        modalRef.componentInstance.title = "Choose the signature for " + this.selectedConverter.getName();
        modalRef.componentInstance.message = null;
        modalRef.componentInstance.capabilityType = this.selectedConverterType;
        modalRef.componentInstance.signatures = this.selectedConverter.getSignatures();
        modalRef.componentInstance.selected = this.selectedSignature;
        return modalRef.result.then(
            (signature: SignatureDescription) => {
                this.selectedSignature = signature;
                this.updateProjectionOperator();
            },
            () => {}
        );
    }

    isSignatureEditable(): boolean {
        if (this.selectedConverter != null) {
            /* For each signatures check if it has at least a parameter
             * if every signature doesn't have any parameters it should not allow
             * to choose between the signatures (since the converter doesn't take arguments) */
            let signatures: SignatureDescription[] = this.selectedConverter.getSignatures();
            //just 1 signature => there's no need to select which one to choose, the eventual params are filled in updateProjectionOperator
            if (signatures.length == 1) {
                return false;
            }
            for (let i = 0; i < signatures.length; i++) {
                if (signatures[i].getParameters().length > 0) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    private updateProjectionOperator() {
        this.projectionOperator = ConverterUtils.getConverterProjectionOperator(this.selectedConverter, this.selectedSignature, this.selectedConverterType);
    }

    private switchConverterType(convType: RDFCapabilityType) {
        this.selectedConverterType = convType;
        this.updateProjectionOperator();
    }

    ok() {
        this.activeModal.close({
            projectionOperator: this.projectionOperator,
            contractDesctiption: this.selectedConverter
        });
    }

    cancel() {
        this.activeModal.dismiss();
    }
}