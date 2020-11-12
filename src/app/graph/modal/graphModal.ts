import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { DataGraphContext } from "../../models/Graphs";
import { UIUtils } from "../../utils/UIUtils";
import { GraphMode } from "../abstractGraph";
import { ForceDirectedGraph } from "../model/ForceDirectedGraph";

@Component({
    selector: "graph-modal",
    templateUrl: "./graphModal.html"
})
export class GraphModal {
    @Input() graph: ForceDirectedGraph;
    @Input() mode: GraphMode;
    @Input() rendering: boolean;
    @Input() role?: RDFResourceRolesEnum; //needed in data-oriented graph in order to inform the graph panel which role should allow to add
    @Input() context?: DataGraphContext; //needed in data-oriented graph in order to inform the graph panel the context which the graph is open from

    GraphModeEnum = GraphMode;

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    ok() {
        this.activeModal.close();
    }

}