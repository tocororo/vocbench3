import { ARTNode } from "../../models/ARTResources";
import { Size } from "./GraphConstants";
import { Node, NodeShape } from "./Node";

export class DataNode extends Node {
    
    constructor(res: ARTNode) {
        super(res);
    }

    initNodeShape() {
        this.shape = NodeShape.rect;
    }

    initNodeMeasure() {
        this.measures = { width: Size.Rectangle.base, height: Size.Rectangle.height };
    }

}