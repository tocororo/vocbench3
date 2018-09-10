import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ARTLiteral } from "../../../../models/ARTResources";
import { LanguageConstraint } from "../../../../models/LanguagesCountries";

export class NewPlainLiteralModalData extends BSModalContext {
    /**
     * @param title the title of the modal dialog
     * @param value the value inserted by default
     * @param valueReadonly if true the input field is disable and cannot be changed
     * @param lang the language selected by default
     * @param langReadonly if true the language selection is disable and language cannot be changed
     */
    constructor(
        public title: string = 'Create new label',
        public value: string,
        public valueReadonly: boolean = false,
        public lang: string,
        public langReadonly: boolean = false,
        public langConstraints: LanguageConstraint = { constrain: false, locale: true }
    ) {
        super();
    }
}

@Component({
    selector: "new-plain-literal-modal",
    templateUrl: "/newPlainLiteralModal.html",
})
export class NewPlainLiteralModal implements ModalComponent<NewPlainLiteralModalData> {
    context: NewPlainLiteralModalData;

    private submitted: boolean = false;

    private value: string;
    private lang: string;

    constructor(public dialog: DialogRef<NewPlainLiteralModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lang = this.context.lang;
        this.value = this.context.value;
        document.getElementById("toFocus").focus();
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            if (!event.shiftKey && !event.altKey && !event.ctrlKey) {
                this.submitted = true;
                if (this.isInputValid()) {
                    this.ok(event);
                }
            }
        }
    }

    private isInputValid(): boolean {
        return (this.value != undefined && this.value.trim() != "");
    }

    ok(event: Event) {
        this.dialog.close(new ARTLiteral(this.value, null, this.lang));
    }

    cancel() {
        this.dialog.dismiss();
    }

}