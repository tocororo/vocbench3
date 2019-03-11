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

    incomingNodes: Node[];
    outgoingNodes: Node[];

    protected shape: NodeShape;
    protected measures: NodeMeasure;
    
    constructor(res: ARTNode) {
        this.res = res;
        this.incomingNodes = [];
        this.outgoingNodes = [];
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

    removeIncomingNode(node: Node) {
        for (let i = this.incomingNodes.length-1; i >= 0; i--) {
            if (this.incomingNodes[i].res.equals(node.res)) {
                this.incomingNodes.splice(i, 1);
                return; //stop looping: the same node could be multiple time as outgoing via different relation
            }
        }
    }
    removeOutgoingNode(node: Node) {
        for (let i = this.outgoingNodes.length-1; i >= 0; i--) {
            if (this.outgoingNodes[i].res.equals(node.res)) {
                this.outgoingNodes.splice(i, 1);
                return; //stop looping: the same node could be multiple time as outgoing via different relation
            }
        }
    }

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