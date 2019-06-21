import { Component, ElementRef } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { UIUtils } from "../../utils/UIUtils";
import { GraphMode } from "../abstractGraph";
import { ForceDirectedGraph } from "../model/ForceDirectedGraph";
import { DataGraphContext } from "../../models/Graphs";

export class GraphModalData extends BSModalContext {
    constructor(
        public graph: ForceDirectedGraph,
        public mode: GraphMode,
        public rendering: boolean,
        public role?: RDFResourceRolesEnum, //needed in data-oriented graph in order to inform the graph panel which role should allow to add
        public context?: DataGraphContext //needed in data-oriented graph in order to inform the graph panel the context which the graph is open from
    ) {
        super();
    }
}

@Component({
    selector: "graph-modal",
    templateUrl: "./graphModal.html"
})
export class GraphModal implements ModalComponent<GraphModalData> {
    context: GraphModalData;

    constructor(public dialog: DialogRef<GraphModalData>, private elementRef: ElementRef) {
        this.context = dialog.context;
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}