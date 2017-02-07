import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {SignatureDescription, ParameterDescription} from "../../utils/Coda";

export class SignaturePickerModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message, if null no the message is shwown the modal
     * @param signatures list of signatures of a converter. There are for sure more than one signature since if 
     * there is just one, converterPickerModal doesn't allow to open this modal to choose a signature
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
        //select as default the signature without params
        // for (var i = 0; i < this.context.signatures.length; i++) {
        //     if (this.context.signatures[i].getParameters().length == 0) {
        //         this.selectedSignature = this.context.signatures[i];
        //     }
        // }
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