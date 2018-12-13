import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef } from "@angular/core";
import { ARTNode, ResAttribute } from "../models/ARTResources";
import { D3Service } from "./d3/d3Services";
import { Node } from "./model/Node";
import { AbstractGraph } from "./abstractGraph";

@Component({
    selector: "",
    template: "",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class AbstractTreeGraph extends AbstractGraph {

    constructor(protected d3Service: D3Service, protected elementRef: ElementRef, protected ref: ChangeDetectorRef) {
        super(d3Service, elementRef, ref);
    }

    protected onNodeClicked(node: Node) {
        let resource: ARTNode = node.res;
        if (resource.getAdditionalProperty(ResAttribute.MORE)) { //if has child
            if (this.graph.hasOutgoingLink(node)) { //if it is open, close it
                this.graph.closeNode(node);
            } else { //otherwise, fetch the children
                this.expandNode(node);
            }
        }
    }

    protected onNodeDblClicked(node: Node) {}

    protected abstract expandNode(node: Node): any;

}