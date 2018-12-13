import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ForceDirectedGraph } from "../model/ForceDirectedGraph";
import { GraphMode } from "../abstractGraph";

export class GraphModalData extends BSModalContext {
    constructor(
        public graph: ForceDirectedGraph,
        public mode: GraphMode,
        public rendering: boolean = true
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

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    constructor(public dialog: DialogRef<GraphModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        // UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}