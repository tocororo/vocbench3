import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomForm } from "../../../../models/CustomForms";

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "cf-selection-modal",
    templateUrl: "./customFormSelectionModal.html",
})
export class CustomFormSelectionModal {
    @Input() title: string; 
    @Input() cfList: Array<CustomForm>; 
    @Input() hideNo: boolean = false;

    selectedCF: CustomForm;

    constructor(public activeModal: NgbActiveModal) {}

    ok() {
        this.activeModal.close(this.selectedCF);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}