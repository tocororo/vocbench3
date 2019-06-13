import { Component, EventEmitter, Input, Output } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../models/ARTResources";
import { User } from "../models/User";
import { ResourceUtils } from "../utils/ResourceUtils";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { OperationSelectModal } from "./modals/operationSelectModal";

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

    constructor(private modal: Modal, private sharedModals: SharedModalServices, private basicModals: BasicModalServices) {}

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
        let timeRegexp: RegExp = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$");
        if (this.fromTime != null && !timeRegexp.test(this.fromTime)) {
            this.basicModals.alert("Invalid time", "'From' time parameter does not comply with the datetime format yyyy-MM-ddThh:mm", "error");
            return;
        }
        if (this.toTime != null && !timeRegexp.test(this.toTime)) {
            this.basicModals.alert("Invalid time", "'To' time parameter does not comply with the datetime format yyyy-MM-ddThh:mm", "error");
            return;
        }
        this.apply.emit({ operations: this.operations, performers: this.performers, fromTime: this.fromTime, toTime: this.toTime });
    }

}