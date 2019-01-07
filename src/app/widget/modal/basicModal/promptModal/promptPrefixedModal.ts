import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";

export class PromptPrefixedModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param prefix prefix to show to the left of the input field
     * @param label label of the input field
     * @param value the default value to show in input field
     * @param hideNo tells if the no button should be hide
     * @param inputOptional tells if the input field is optional or mandatory
     * @param inputSanitized tells if the input field should be sanitized
     */
    constructor(
        public title: string = "Modal Title",
        public prefix: string,
        public label: string,
        public value: string,
        public hideNo: boolean = false,
        public inputOptional: boolean = false,
        public inputSanitized: boolean = false,
        public prefixEditable: boolean = false
    ) {
        super();
    }
}

@Component({
    selector: "prompt-prefixed-modal",
    templateUrl: "./promptPrefixedModal.html",
})
export class PromptPrefixedModal implements ModalComponent<PromptPrefixedModalData> {
    context: PromptPrefixedModalData;

    private expandedTxt: string;
    private prefixedTxt: string;

    private namespaceLocked: boolean = true;
    private submitted: boolean = false;

    constructor(public dialog: DialogRef<PromptPrefixedModalData>) {
        this.context = dialog.context;
        this.prefixedTxt = this.context.value;
    }

    ngAfterViewInit() {
        document.getElementById("toFocus").focus();
    }

    //========= ID Namespace-lock HANDLER =========

    private unlockNamespace() {
        this.namespaceLocked = !this.namespaceLocked;
        if (this.namespaceLocked) { //from free id to locked namespace
            this.fromExpandedToPrefixed();
        } else { //from locked namespace to free id
            this.expandedTxt = this.context.prefix + (this.prefixedTxt != null ? this.prefixedTxt : "");
        }
    }

    private fromExpandedToPrefixed() {
        let separatorIdx: number = this.expandedTxt.lastIndexOf(".");
        if (separatorIdx > 0) {
            this.context.prefix = this.expandedTxt.substring(0, separatorIdx + 1);
            this.prefixedTxt = this.expandedTxt.substring(separatorIdx + 1);
        } else {  //no . in the id => restore the original id
            this.prefixedTxt = null;
        }
    }

    //============================

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        let value: string;
        if (this.namespaceLocked) {
            value = this.context.prefix + this.prefixedTxt;
        } else {
            value = this.expandedTxt;
        }

        this.dialog.close(value);
    }

    cancel() {
        this.dialog.dismiss();
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            this.submitted = true;
            if (this.isInputValid()) {
                this.ok(event);
            }
        }
    }

    private isInputValid(): boolean {
        if (this.namespaceLocked) {
            return (this.prefixedTxt != undefined && this.prefixedTxt.trim() != "");
        } else {
            return (this.expandedTxt != undefined && this.expandedTxt.trim() != "");
        }
    }

}