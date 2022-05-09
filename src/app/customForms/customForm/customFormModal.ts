import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { CustomFormUtils, CustomFormValue, FeatureNameEnum, FormField } from "../../models/CustomForms";
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
            this.basicModals.alert({ key: "STATUS.WARNING" }, constraintViolatedMsg, ModalType.warning);
            return;
        }


        let userPromptMap: { [key: string]: any } = {};
        let stdFormMap: { [key: string]: any } = {};
        for (let i = 0; i < this.formFields.length; i++) {
            let entry = this.formFields[i];

            let value: any = entry.value;
            let empty: boolean = false;
            try { if (value.trim() == "") { empty = true; } } catch (err) { } //entry value could be not a string, so the check is in a try-catch

            if (!empty) {
                // //add the entry only if not already in
                // let alreadyIn: boolean = Object.keys(userPromptMap).includes(entry.getUserPrompt())
                // if (!alreadyIn) {
                //     userPromptMap[entry.getUserPrompt()] = value;
                // }
                //note: I didn't understand why I checked if I added the entry if not yet in. In case it was already it would be simply replaced
                if (entry.getFeatureName() == FeatureNameEnum.userPrompt) {
                    userPromptMap[entry.getUserPrompt()] = value;
                } else {
                    stdFormMap[entry.getUserPrompt()] = value;
                }
            }
        }
        let cfValue: CustomFormValue = new CustomFormValue(this.cfId, userPromptMap, stdFormMap);
        this.activeModal.close(cfValue);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}