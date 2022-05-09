import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from '../../Modals';

@Component({
    selector: "alert-modal",
    templateUrl: "./alertModal.html",
    styleUrls: ['../../modals.css']
})
export class AlertModal {

    @Input() title: string;
    @Input() message: string;
    @Input() type: ModalType;
    @Input() details: string;
    @Input() checkboxLabel: string;

    titleClass: string;
    alertClass: string;

    detailsCollapsed: boolean = true;

    checkbox: boolean = false;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        //based on the modal type set the css style of the message alert

        if (this.type == null) {
            this.type = ModalType.info;
        }
        if (this.type == ModalType.info) {
            this.titleClass = "text-info";
            this.alertClass = "alert alert-info";
        } else if (this.type == ModalType.warning) {
            this.titleClass = "text-warning";
            this.alertClass = "alert alert-warning";
        } else if (this.type == ModalType.error) {
            this.titleClass = "text-danger";
            this.alertClass = "alert alert-danger";
        }
    }

    ok() {
        this.activeModal.close(this.checkbox);
    }

    close() {
        this.activeModal.dismiss();
    }

}