import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { CustomForm } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";
import { CustomFormEditorModal } from './customFormEditorModal';

@Component({
    selector: "cf-picker-modal",
    templateUrl: "./customFormPickerModal.html",
})
export class CustomFormPickerModal {
    @Input() title: string;
    
    customForms: CustomForm[];
    selectedCustomForm: CustomForm;

    constructor(public activeModal: NgbActiveModal, private cfService: CustomFormsServices, private modalService: NgbModal) {}

    ngOnInit() {
        this.cfService.getAllCustomForms().subscribe(
            cForms => {
                this.customForms = cForms;
            }
        );
    }

    showCustomForm() {
        const modalRef: NgbModalRef = this.modalService.open(CustomFormEditorModal, new ModalOptions('xl'));
        modalRef.componentInstance.id = this.selectedCustomForm.getId();
        modalRef.componentInstance.readOnly = true;
    }

    ok() {
        this.activeModal.close(this.selectedCustomForm);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}