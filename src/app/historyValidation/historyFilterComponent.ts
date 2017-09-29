import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { OperationSelectModal } from "./operationSelectModal";
import { ARTURIResource, ResourceUtils } from "../models/ARTResources";

@Component({
    selector: "history-filter",
    templateUrl: "./historyFilterComponent.html"
})
export class HistoryFilterComponent {

    @Input() operations: ARTURIResource[];
    @Input() fromTime: string;
    @Input() toTime: string;
    @Output() apply: EventEmitter<{ operations: ARTURIResource[], fromTime: string, toTime: string }> = new EventEmitter();

    constructor(private modal: Modal) {}

    ngOnInit() {
        if (this.operations == null) {
            this.operations = [];
        }
    }

    private selectOperationFilter() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
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

    private applyFilter() {
        this.apply.emit({ operations: this.operations, fromTime: this.fromTime, toTime: this.toTime });
    }

}