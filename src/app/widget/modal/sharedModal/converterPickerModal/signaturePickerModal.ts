import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RDFCapabilityType, SignatureDescription } from "../../../../models/Coda";

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "signature-picker-modal",
    templateUrl: "./signaturePickerModal.html",
})
export class SignaturePickerModal {
    @Input() title: string;
    @Input() message: string;
    @Input() capabilityType: RDFCapabilityType; //uri or literal: filter the signatures to only those which the return type is compliant with it
    @Input() signatures: SignatureDescription[]; //available signatures to show
    @Input() selected: SignatureDescription; //the one to initialize as selected in the table

    signatureList: SignatureDescription[];
    selectedSignature: SignatureDescription;
    
    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        /*filter the signatures according the required capabililty. 
        This is useful in order to prevent showing twice the same signature (same parameters), one for literal and one for uri, when the converter capability is node
        (e.g. formatter has the same signature (String, Value[]) for both uri and literal)
        */
        this.signatureList = this.signatures.filter(s => {
            return (s.getReturnType().endsWith("IRI") && this.capabilityType == RDFCapabilityType.uri) ||
                (s.getReturnType().endsWith("Literal") && this.capabilityType == RDFCapabilityType.literal) ||
                s.getReturnType().endsWith("Value");
        });
        this.selectedSignature = this.selected;
    }

    selectSignature(signature: SignatureDescription) {
        this.selectedSignature = signature;
    }

    ok() {
        this.activeModal.close(this.selectedSignature);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}