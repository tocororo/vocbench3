import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { GraphMode } from '../abstractGraph';
import { AbstractGraphNode } from '../abstractGraphNode';
import { Node } from '../model/Node';

@Component({
    selector: '[dataNode]',
    templateUrl: "./dataNodeComponent.html",
    styleUrls: ['../graph.css']
})
export class DataNodeComponent extends AbstractGraphNode {

    @Input() dataNode: Node;

    graphMode = GraphMode.dataOriented;

    private stripePercentage: number; //percentage of the rect height to dedicate to the top stripe
    private stripeHeight: number; //height (in px) of the top stripe

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnInit() {
        this.node = this.dataNode;
        this.initNode();
        this.initMeasures();
    }

    private initMeasures() {
        let fontSize: number = 11;
        let padding: number = 2;
        this.stripeHeight = fontSize + 2*padding;
        this.stripePercentage = Math.ceil(this.stripeHeight * 100 / this.measures.height);
    }

}