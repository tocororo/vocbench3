import { Component, EventEmitter, Input, Output } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, ResourceUtils } from "../models/ARTResources";
import { User } from "../models/User";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { OperationSelectModal } from "./operationSelectModal";

@Component({
    selector: "history-filter",
    templateUrl: "./historyFilterComponent.html"
})
export class HistoryFilterComponent {

    @Input() operations: ARTURIResource[];
    @Input() performers: User[];
    @Input() fromTime: string;
    @Input() toTime: string;
    @Output() apply: EventEmitter<{ operations: ARTURIResource[], performers: User[], fromTime: string, toTime: string }> = new EventEmitter();

    constructor(private modal: Modal, private sharedModals: SharedModalServices) {}

    ngOnInit() {
        if (this.operations == null) {
            this.operations = [];
        }
    }

    private selectOperationFilter() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(OperationSelectModal, overlayConfig).result.then(
            (operations: any) => {
                //for each operation to add, add it only if not already in operations array
                operations.forEach((op: ARTURIResource) => {
                    if (!ResourceUtils.containsNode(this.operations, op)) {
                        this.operations.push(op);
                    }
                });
            },
            () => {}
        );
    }

    private removeOperationFilter(operation: ARTURIResource) {
        this.operations.splice(this.operations.indexOf(operation), 1);
    }

    private selectOperationPerformer() {
        this.sharedModals.selectUser("Select User", true).then(
            (user: User) => {
                for (let i = 0; i < this.performers.length; i++) {
                    if (this.performers[i].getIri() == user.getIri()) {
                        return; //user already in
                    }
                }
                this.performers.push(user);
            },
            () => {}
        );
    }

    private removeOperationPerformer(user: User) {
        this.performers.splice(this.performers.indexOf(user), 1);
    }

    private applyFilter() {
        this.apply.emit({ operations: this.operations, performers: this.performers, fromTime: this.fromTime, toTime: this.toTime });
    }

}