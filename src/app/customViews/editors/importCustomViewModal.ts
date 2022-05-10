import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomViewReference } from 'src/app/models/CustomViews';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';

@Component({
    selector: "import-cv-modal",
    templateUrl: "./importCustomViewModal.html",
})
export class ImportCustomViewModal {

    @Input() existingCV: CustomViewReference[];

    name: string;
    file: File;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices) { }

    fileChangeEvent(file: File) {
        this.file = file;
    }

    ok() {
        if (this.existingCV.some(cv => cv.name == this.name)) {
            this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "CUSTOM_VIEWS.MESSAGES.ALREADY_EXISTING_CUSTOM_VIEW" }, ModalType.warning);
            return;
        }
        let returnData: ImportCvModalReturnData = {
            name: this.name,
            file: this.file
        };
        this.activeModal.close(returnData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

    isInputValid(): boolean {
        return this.file != null && this.name != null && this.name.trim() != "";
    }

}

export interface ImportCvModalReturnData {
    file: File;
    name: string;
}