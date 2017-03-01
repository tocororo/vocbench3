import {Component} from "@angular/core";
import {BSModalContext, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent, Modal, OverlayConfig} from "angular2-modal";
import {SignaturePickerModal, SignaturePickerModalData} from "./signaturePickerModal";
import {CODAServices} from "../../services/codaServices"
import {ConverterContractDescription, SignatureDescription, ParameterDescription} from "../../models/Coda";

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
    private selectedConverterType: "uri" | "literal"; //uri/literal
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
            if (this.selectedConverter.getRDFCapability() == "literal" || this.selectedConverter.getRDFCapability() == "typedLiteral") {
                this.selectedConverterType = "literal";
            } else { //'node' or 'uri'
                this.selectedConverterType = "uri";
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
        return this.modal.open(SignaturePickerModal, overlayConfig).then(
            dialog => dialog.result.then(
                (signature: SignatureDescription) => {
                    this.selectedSignature = signature;
                    this.updateProjectionOperator();
                },
                () => {}
            )
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
        this.projectionOperator = "";
        if (this.selectedConverter != null) {
            this.projectionOperator += this.selectedConverterType; //'uri' or 'literal'
            //default converter doesn't need to be specified explicitly
            if (this.selectedConverter.getName() == "DefaultConverter") {
                return;
            }
            let convQName = this.selectedConverter.getURI().replace("http://art.uniroma2.it/coda/contracts/", "coda:")
            this.projectionOperator += "(" + convQName + "(";
            //converter params
            this.projectionOperator += this.serializeConverterParams();
            this.projectionOperator += "))";
        }
    }

    private serializeConverterParams(): string {
        var params: string = "";
        var signatureParams: ParameterDescription[] = this.selectedSignature.getParameters();
        for (var i = 0; i < signatureParams.length; i++) {
            if (signatureParams[i].getType().startsWith("java.util.Map")) {
                params += "{ key = \"value\"}, ";    
            } else { //java.lang.String
                params += "\"" + this.selectedSignature.getParameters()[i].getName() + "\", ";
            }
        }
        params = params.slice(0, -2); //remove the final ', '
        return params;
    }

    private switchConverterType(convType: "uri"|"literal") {
        this.selectedConverterType = convType;
        this.updateProjectionOperator();
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close(this.projectionOperator);
    }

    cancel() {
        this.dialog.dismiss();
    }
}