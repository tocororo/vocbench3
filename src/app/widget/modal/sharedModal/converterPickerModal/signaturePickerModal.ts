import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SignatureDescription } from "../../../../models/Coda";

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
    @Input() signatures: SignatureDescription[];
    @Input() selected: SignatureDescription;

    selectedSignature: SignatureDescription;
    
    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
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