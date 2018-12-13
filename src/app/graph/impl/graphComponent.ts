import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from "@angular/core";
import { D3Service } from "../d3/d3Services";
import { Node } from "../model/Node";
import { AbstractGraph } from "../abstractGraph";

@Component({
    selector: 'graph',
    templateUrl: "./graphComponent.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../graph.css']
})
export class GraphComponent extends AbstractGraph {

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef) {
        super(d3Service, elementRef, ref);
    }

    protected onNodeDblClicked(node: Node) {
    }
}