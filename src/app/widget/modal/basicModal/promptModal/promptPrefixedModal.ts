import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "prompt-prefixed-modal",
    templateUrl: "./promptPrefixedModal.html",
})
export class PromptPrefixedModal {
    @Input() title: string;
    @Input() prefix: string;
    @Input() label: string;
    @Input() value: string;
    @Input() hideNo: boolean = false;
    @Input() inputOptional: boolean = false;
    @Input() inputSanitized: boolean = false;
    @Input() prefixEditable: boolean = false;

    private expandedTxt: string;
    private prefixedTxt: string;

    namespaceLocked: boolean = true;
    submitted: boolean = false;

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.prefixedTxt = this.value;
    }

    //========= ID Namespace-lock HANDLER =========

    private unlockNamespace() {
        this.namespaceLocked = !this.namespaceLocked;
        if (this.namespaceLocked) { //from free id to locked namespace
            this.fromExpandedToPrefixed();
        } else { //from locked namespace to free id
            this.expandedTxt = this.prefix + (this.prefixedTxt != null ? this.prefixedTxt : "");
        }
    }

    private fromExpandedToPrefixed() {
        let separatorIdx: number = this.expandedTxt.lastIndexOf(".");
        if (separatorIdx > 0) {
            this.prefix = this.expandedTxt.substring(0, separatorIdx + 1);
            this.prefixedTxt = this.expandedTxt.substring(separatorIdx + 1);
        } else {  //no . in the id => restore the original id
            this.prefixedTxt = null;
        }
    }

    //============================

    ok() {
        let value: string;
        if (this.namespaceLocked) {
            value = this.prefix + this.prefixedTxt;
        } else {
            value = this.expandedTxt;
        }

        this.activeModal.close(value);
    }

    cancel() {
        this.activeModal.dismiss();
    }

    onEnter() {
        this.submitted = true;
        if (this.isInputValid()) {
            this.ok();
        }
    }

    isInputValid(): boolean {
        if (this.namespaceLocked) {
            return (this.prefixedTxt != undefined && this.prefixedTxt.trim() != "");
        } else {
            return (this.expandedTxt != undefined && this.expandedTxt.trim() != "");
        }
    }

}