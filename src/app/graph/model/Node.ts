import { ARTNode } from "../../models/ARTResources";

export abstract class Node implements d3.SimulationNodeDatum {
    
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;

    res: ARTNode;
    fixed: boolean = false;

    protected shape: NodeShape;
    protected measures: NodeMeasure;
    
    constructor(res: ARTNode) {
        this.res = res;
    }

    getNodeShape(): NodeShape {
        if (this.shape == null) { //initialize only if not yet done
            this.initNodeShape();
        }
        return this.shape;
    }

    getNodeMeaseure(): NodeMeasure {
        if (this.measures == null) {
            this.initNodeMeasure();
        }
        return this.measures;
    }

    getNodeWidth(): number {
        let shape = this.getNodeShape();
        if (shape == NodeShape.circle) {
            return this.getNodeMeaseure().radius * 2;
        } else {
            return this.getNodeMeaseure().width;
        }
    }

    getNodeHeight(): number {
        let shape = this.getNodeShape();
        if (shape == NodeShape.circle) {
            return this.getNodeMeaseure().radius * 2;
        } else {
            return this.getNodeMeaseure().height;
        }
    }

    protected abstract initNodeShape(): void;
    protected abstract initNodeMeasure(): void;

}

export enum NodeShape {
    circle = "circle",
    octagon = "octagon",
    label = "label",
    rect = "rect",
    square = "square"
}

export class NodeMeasure {
    width?: number; //for all shapes but circle
    height?: number; //for all shapes but circle
    radius?: number; //only for circle
}