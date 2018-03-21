import { Component } from "@angular/core";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent, Modal, OverlayConfig } from "ngx-modialog";
import { SignaturePickerModal, SignaturePickerModalData } from "./signaturePickerModal";
import { CODAServices } from "../../../../services/codaServices"
import { ConverterContractDescription, ConverterUtils, SignatureDescription, ParameterDescription, RDFCapabilityType } from "../../../../models/Coda";

export class ConverterPickerModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "converter-picker-modal",
    templateUrl: "./converterPickerModal.html",
})
export class ConverterPickerModal implements ModalComponent<ConverterPickerModalData> {
    context: ConverterPickerModalData;
    
    private converters: ConverterContractDescription[];
    private selectedConverter: ConverterContractDescription;
    private selectedConverterType: RDFCapabilityType; //uri/literal
    private selectedSignature: SignatureDescription;

    private projectionOperator: string = "";
    
    constructor(public dialog: DialogRef<ConverterPickerModalData>, private modal: Modal, private codaService: CODAServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.codaService.listConverterContracts().subscribe(
            converterList => {
                this.converters = converterList;
            }
        );
    }

    private selectConverter(converter: ConverterContractDescription) {
        if (converter != this.selectedConverter) {
            this.selectedConverter = converter;
            if (this.selectedConverter.getRDFCapability() == RDFCapabilityType.literal || this.selectedConverter.getRDFCapability() == RDFCapabilityType.typedLiteral) {
                this.selectedConverterType = RDFCapabilityType.literal;
            } else { //'node' or 'uri'
                this.selectedConverterType = RDFCapabilityType.uri;
            }
            //set as selected signature the one with less parameters
            var signatures = this.selectedConverter.getSignatures();
            this.selectedSignature = signatures[0];
            for (var i = 1; i < signatures.length; i++) {
                if (signatures[i].getParameters().length < this.selectedSignature.getParameters().length) {
                    this.selectedSignature = signatures[i];
                }
            }
            this.updateProjectionOperator();
        }
    }

    private chooseSignature() {
        var modalData = new SignaturePickerModalData("Choose the signature for " + this.selectedConverter.getName(), null,
            this.selectedConverter.getSignatures(), this.selectedSignature);
        const builder = new BSModalContextBuilder<SignaturePickerModalData>(
            modalData, undefined, SignaturePickerModalData
        );
        builder.keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(SignaturePickerModal, overlayConfig).result.then(
            (signature: SignatureDescription) => {
                this.selectedSignature = signature;
                this.updateProjectionOperator();
            },
            () => {}
        );
    }

    private isSignatureEditable(): boolean {
        if (this.selectedConverter != null) {
            /* For each signatures check if it has at least a parameter
             * if every signature doesn't have any parameters it should not allow
             * to choose between the signatures (since the converter doesn't take arguments) */
            let signatures: SignatureDescription[] = this.selectedConverter.getSignatures();
            //just 1 signature => there's no need to select which one to choose, the eventual params are filled in updateProjectionOperator
            if (signatures.length == 1) {
                return false;
            }
            for (var i = 0; i < signatures.length; i++) {
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

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close({
            projectionOperator: this.projectionOperator,
            contractDesctiption: this.selectedConverter
        });
    }

    cancel() {
        this.dialog.dismiss();
    }
}