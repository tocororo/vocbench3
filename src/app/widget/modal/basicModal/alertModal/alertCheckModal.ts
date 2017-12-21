import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";

export class AlertCheckModalData extends BSModalContext {
    /**
     * @param title modal title
     * @param message modal message
     * @param type type of the modal. Determines the style of the message alert.
     *      Available values: "info", "warning", "error"
     * @param details futher details that will be shown in an expandable panel (useful to show Exception name)
     */
    constructor(
        public title: string = 'Modal Title',
        public message: string = 'Modal Body!',
        public checkboxLabel: string = 'Label check',
        public type: string = 'info',
        public details: string
    ) {
        super();
    }
}

@Component({
    selector: "alert-check-modal",
    templateUrl: "./alertCheckModal.html",
})
export class AlertCheckModal implements ModalComponent<AlertCheckModalData> {
    context: AlertCheckModalData;

    private headerStyle: string;
    private msgStyle: string;

    private check: boolean = false;

    private detailsCollapsed: boolean = true;

    constructor(public dialog: DialogRef<AlertCheckModalData>) {
        this.context = dialog.context;

        //based on the modal type set the css style of the message alert
        switch (this.context.type) {
            case "info":
                this.msgStyle = "vbox alert alert-info";
                this.headerStyle = "modal-title text-info";
                break;
            case "error":
                this.msgStyle = "vbox alert alert-danger";
                this.headerStyle = "modal-title text-danger";
                break;
            case "warning":
                this.msgStyle = "vbox alert alert-warning";
                this.headerStyle = "modal-title text-warning";
                break;
            default:
                this.msgStyle = "vbox alert alert-info";
                this.headerStyle = "modal-title text-info";
                break;
        }
    }

    ok() {
        this.dialog.close(this.check);
    }

}