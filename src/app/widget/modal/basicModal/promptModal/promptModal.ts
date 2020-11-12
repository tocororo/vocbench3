import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "prompt-modal",
    templateUrl: "./promptModal.html",
})
export class PromptModal {

    @Input() title: string;
    @Input() label: { value: string, tooltip?: string };
    @Input() message: string;
    @Input() value: string;
    @Input() hideNo: boolean = false;
    @Input() inputOptional: boolean = false;
    @Input() inputSanitized: boolean = false;

    constructor(public activeModal: NgbActiveModal) { }
    
    ngOnInit() {
    }

    isInputValid(): boolean {
        return (this.value != undefined && this.value.trim() != "");
    }

    ok() {
		if (this.inputOptional || this.isInputValid()) {
			this.activeModal.close(this.value);
		}
	}

	close() {
		this.activeModal.dismiss();
	}

}