import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType, SelectionOption } from '../../Modals';

/**
 * Modal that allows to choose among a set of options
 */
@Component({
    selector: "selection-modal",
    templateUrl: "./selectionModal.html",
})
export class SelectionModal {
    @Input() title: string;
    @Input() message: string;
    @Input() options: Array<string | SelectionOption>;
    @Input() type: ModalType;

    headerStyle: string;
    msgStyle: string;
    
    plainOptions: boolean; //tells if the options are plains or complex object (value+description)
    optionSelected: any; //string or {string, string} object, according the input options list
    private size: number;
    
    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.size = 20; //max size of the select element
        if (this.options.length < this.size) {
            this.size = this.options.length;
        }

        this.plainOptions = (this.options.length > 0 && typeof this.options[0] == "string");

        //based on the modal type set the css style of the message alert
        if (this.type == null) {
			this.type = ModalType.info
		}
		if (this.type == ModalType.info) {
			this.headerStyle = "modal-title text-info";
			this.msgStyle = "alert alert-info";
		} else if (this.type == ModalType.warning) {
			this.headerStyle = "modal-title text-warning";
			this.msgStyle = "alert alert-warning";
		} else if (this.type == ModalType.error) {
			this.headerStyle = "modal-title text-danger";
			this.msgStyle = "alert alert-danger";
		}

    }

    ok() {
        this.activeModal.close(this.optionSelected);
    }

    cancel() {
        this.activeModal.dismiss();
    }
}