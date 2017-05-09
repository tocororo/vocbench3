import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { CustomForm } from "../../../../models/CustomForms";

export class CustomFormSelectionModalData extends BSModalContext {
    /**
     * @param title title of the modal
     * @param cfList array of CustomForm among which choose
     * @param hideNo tells if the no button should be hide
     */
    constructor(public title: string, public cfList: Array<CustomForm>, public hideNo: boolean = false) {
        super();
    }
}

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "cf-selection-modal",
    templateUrl: "./customFormselectionModal.html",
})
export class CustomFormSelectionModal implements ModalComponent<CustomFormSelectionModalData> {
    context: CustomFormSelectionModalData;

    private selectedCF: CustomForm;

    constructor(public dialog: DialogRef<CustomFormSelectionModalData>) {
        this.context = dialog.context;
    }

    private selectCF(cf: CustomForm) {
        this.selectedCF = cf;
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close(this.selectedCF);
    }

    cancel() {
        this.dialog.dismiss();
    }
}