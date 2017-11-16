import {Component} from "@angular/core";
import {BSModalContext} from 'ngx-modialog/plugins/bootstrap';
import {DialogRef, ModalComponent} from "ngx-modialog";
import {SignatureDescription, ParameterDescription} from "../../../../models/Coda";

export class SignaturePickerModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param signatures list of signatures of a converter. There are for sure more than one signature since if 
     * there is just one, converterPickerModal doesn't allow to open this modal to choose a signature
     * @param signature the signature selected as default
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string,
        public signatures: SignatureDescription[],
        public selected: SignatureDescription
    ) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "signature-picker-modal",
    templateUrl: "./signaturePickerModal.html",
})
export class SignaturePickerModal implements ModalComponent<SignaturePickerModalData> {
    context: SignaturePickerModalData;

    private selectedSignature: SignatureDescription;
    
    constructor(public dialog: DialogRef<SignaturePickerModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.selectedSignature = this.context.selected;
    }

    private selectSignature(signature: SignatureDescription) {
        this.selectedSignature = signature;
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close(this.selectedSignature);
    }

    cancel() {
        this.dialog.dismiss();
    }
}