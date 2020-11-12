import { Directive, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from '../../Modals';

@Directive()
export abstract class AbstractConfirmModal implements OnInit {

    @Input() title: string;
    @Input() message: string;
    @Input() type: ModalType;
    @Input() yesText: string = 'Yes';
    @Input() noText: string = 'No';

    titleClass: string;
    alertClass: string;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        //based on the modal type set the css style of the message alert
        if (this.type == null) {
            this.type = ModalType.info
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

    abstract ok(): void;

    abstract close(): void;

}
