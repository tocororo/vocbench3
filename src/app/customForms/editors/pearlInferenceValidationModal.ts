import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { PearlValidationResult } from "../../models/Coda";
import { CustomFormsServices } from "../../services/customFormsServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "pearl-inference-modal",
    templateUrl: "./pearlInferenceValidationModal.html",
})
export class PearlInferenceValidationModal {
    @Input() oldPearl: string;
    @Input() newPearl: string;

    constructor(public activeModal: NgbActiveModal, private cfService: CustomFormsServices, private basicModals: BasicModalServices) { }


    ok() {
        this.cfService.validatePearl(this.newPearl, "graph").subscribe(
            (result: PearlValidationResult) => {
                if (result.valid) {
                    this.activeModal.close(this.newPearl);
                } else {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, result.details, ModalType.error);
                    return;
                }
            }
        );

    }

    cancel() {
        this.activeModal.dismiss();
    }

}