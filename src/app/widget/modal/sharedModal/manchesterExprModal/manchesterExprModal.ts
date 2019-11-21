import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';

export class ManchesterExprModalData extends BSModalContext {
    /**
     * @param title the title of the modal dialog
     * @param expression the value inserted by default
     */
    constructor(
        public title: string = 'Create a new manchester expression',
        public expression: string,
    ) {
        super();
    }
}

@Component({
    selector: "manchester-modal",
    templateUrl: "/manchesterExprModal.html",
})
export class ManchesterExprModal implements ModalComponent<ManchesterExprModalData> {
    context: ManchesterExprModalData;

    private expression: string;

    constructor(public dialog: DialogRef<ManchesterExprModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.expression = this.context.expression;
    }

    isOkEnabled(): boolean {
        return this.expression != null && this.expression.trim() != "";
    }

    ok(event: Event) {
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }

}