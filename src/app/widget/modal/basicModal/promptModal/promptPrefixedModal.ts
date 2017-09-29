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
        public inputSanitized: boolean = false
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

    private inputTxt: string;

    private submitted: boolean = false;

    constructor(public dialog: DialogRef<PromptPrefixedModalData>) {
        this.context = dialog.context;
        this.inputTxt = this.context.value;
    }

    ngOnInit() {
        document.getElementById("toFocus").focus();
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.inputTxt);
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
        return (this.inputTxt != undefined && this.inputTxt.trim() != "");
    }

}