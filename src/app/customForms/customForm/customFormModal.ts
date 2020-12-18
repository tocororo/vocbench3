import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { CustomFormUtils, FormField } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "custom-form-modal",
    templateUrl: "./customFormModal.html",
})
export class CustomFormModal {
    @Input() title: string;
    @Input() cfId: string;
    @Input() language?: string;

    private ontoType: string;
    
    formFields: FormField[] = [];
    
    constructor(public activeModal: NgbActiveModal, public cfService: CustomFormsServices, public browsingModals: BrowsingModalServices,
        private basicModals: BasicModalServices) {
    }

    /**
     * Valid if all the mandatory fields are not empty
     */
    isInputValid(): boolean {
        return CustomFormUtils.isFormValid(this.formFields);
    }

    ok() {
        let constraintViolatedMsg = CustomFormUtils.isFormConstraintOk(this.formFields);
        if (constraintViolatedMsg != null) {
            this.basicModals.alert({key:"STATUS.WARNING"}, constraintViolatedMsg, ModalType.warning);
            return;
        }

        var entryMap: {[key: string]: any} = {}; //{key: value, key: value,...}
        for (var i = 0; i < this.formFields.length; i++) {
            var entry = this.formFields[i];

            let value: any = entry.value;
            let empty: boolean = false;
            try { if (value.trim() == "") { empty = true; } } catch (err) {} //entry value could be not a string, so the check is in a try-catch

            if (!empty) {
                //add the entry only if not already in
                var alreadyIn: boolean = false;
                for (var key in entryMap) {
                    if (key == entry.getUserPrompt()) {
                        alreadyIn = true;
                        break;
                    }
                }
                if (!alreadyIn) {
                    entryMap[entry.getUserPrompt()] = value;
                }
            }
        }
        this.activeModal.close(entryMap);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}