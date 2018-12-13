import { Component, Input } from '@angular/core';
import { Size } from '../model/GraphConstants';
import { Node, NodeShape } from '../model/Node';
import { GraphMode } from '../abstractGraph';
import { AbstractGraphNode } from '../abstractGraphNode';

@Component({
    selector: '[nodeModel]',
    templateUrl: "./nodeModelComponent.html",
    styleUrls: ['../graph.css']
})
export class NodeModelComponent extends AbstractGraphNode {

    @Input() nodeModel: Node;

    graphMode = GraphMode.modelOriented;

    private nodeShape: NodeShape;
    private squareSide: number = Size.Square.side;
    private rectHeight: number = Size.Rectangle.height;
    private rectBase: number = Size.Rectangle.base;
    private circleRadius: number = Size.Circle.radius;
    private octagonPoints: string = 
        (-Size.Octagon.base / 2 + Size.Octagon.cut) + " " + (-Size.Octagon.height / 2) + " , " +
        (Size.Octagon.base / 2 - Size.Octagon.cut) + " " + (-Size.Octagon.height / 2) + " , " +
        (Size.Octagon.base / 2) + " " + (-Size.Octagon.height / 2 + Size.Octagon.cut) + " , " +
        (Size.Octagon.base / 2) + " " + (Size.Octagon.height / 2 - Size.Octagon.cut) + " , " +
        (Size.Octagon.base / 2 - Size.Octagon.cut) + " " + (Size.Octagon.height / 2) + " , " +
        (-Size.Octagon.base / 2 + Size.Octagon.cut) + " " + (Size.Octagon.height / 2) + " , " +
        (-Size.Octagon.base / 2) + " " + (Size.Octagon.height / 2 - Size.Octagon.cut) + " , " +
        (-Size.Octagon.base / 2) + " " + (-Size.Octagon.height / 2 + Size.Octagon.cut);
    private labelPoints: string =
        (-Size.Label.base / 2) + " " + (-Size.Label.height / 2) + " , " +
        (Size.Label.base / 2 - Size.Label.cut) + " " + (-Size.Label.height / 2) + " , " +
        (Size.Label.base / 2) + " 0, " +
        (Size.Label.base / 2 - Size.Label.cut) + " " + (Size.Label.height / 2) + " , " +
        (-Size.Label.base / 2) + " " + (Size.Label.height / 2);

    ngOnInit() {
        this.node = this.nodeModel;
        this.initNode();
        this.nodeShape = this.node.getNodeShape(GraphMode.modelOriented);
    }

}