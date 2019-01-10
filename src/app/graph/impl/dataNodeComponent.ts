import { Component, Input } from '@angular/core';
import { Size } from '../model/GraphConstants';
import { Node } from '../model/Node';
import { GraphMode } from '../abstractGraph';
import { AbstractGraphNode } from '../abstractGraphNode';

@Component({
    selector: '[dataNode]',
    templateUrl: "./dataNodeComponent.html",
    styleUrls: ['../graph.css']
})
export class DataNodeComponent extends AbstractGraphNode {

    @Input() dataNode: Node;

    graphMode = GraphMode.dataOriented;

    private rectHeight: number = Size.Rectangle.height;
    private rectBase: number = Size.Rectangle.base;

    private stripePercentage: number; //percentage of the rect height to dedicate to the top stripe
    private stripeHeight: number; //height (in px) of the top stripe

    ngOnInit() {
        this.node = this.dataNode;
        this.initNode();
        this.initMeasures();
    }

    private initMeasures() {
        let fontSize: number = 11;
        let padding: number = 2;
        this.stripeHeight = fontSize + 2*padding;
        this.stripePercentage = Math.ceil(this.stripeHeight * 100 / this.rectHeight);
    }

}