import { Component, Input } from '@angular/core';
import { RDFResourceRolesEnum } from '../../models/ARTResources';
import { GraphMode } from '../abstractGraph';
import { AbstractGraphNode } from '../abstractGraphNode';
import { Size } from '../model/GraphConstants';
import { Node, NodeShape } from '../model/Node';

@Component({
    selector: '[modelNode]',
    templateUrl: "./modelNodeComponent.html",
    styleUrls: ['../graph.css']
})
export class NodeModelComponent extends AbstractGraphNode {

    @Input() modelNode: Node;

    graphMode = GraphMode.modelOriented;

    private nodeShape: NodeShape;

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

    private isObjectProperty: boolean;

    ngOnInit() {
        this.node = this.modelNode;
        this.initNode();
        this.nodeShape = this.node.getNodeShape();
        this.isObjectProperty = this.node.res.getRole() == RDFResourceRolesEnum.objectProperty;
    }

}