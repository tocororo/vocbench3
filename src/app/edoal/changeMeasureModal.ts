import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";

export class ChangeMeasureModalData extends BSModalContext {
    constructor(
        public value: number,
        public min: number = 0,
        public max: number = 1,
        public step: number = .01
    ) {
        super();
    }
}

@Component({
    selector: "change-measure-modal",
    templateUrl: "./changeMeasureModal.html",
})
export class ChangeMeasureModal implements ModalComponent<ChangeMeasureModalData> {
    context: ChangeMeasureModalData;

    private value: number;

    constructor(public dialog: DialogRef<ChangeMeasureModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.value = this.context.value;
        document.getElementById("toFocus").focus();
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.value);
    }

    cancel() {
        this.dialog.dismiss();
    }

    private isInputValid(): boolean {
        return (typeof this.value == "number" && this.value >= 0 && this.value <= 1);
    }

}