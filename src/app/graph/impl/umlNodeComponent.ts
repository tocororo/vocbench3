import { UmlLink } from './../model/UmlLink';
import { ForceDirectedGraph } from './../model/ForceDirectedGraph';
import { ResourceUtils } from './../../utils/ResourceUtils';
import { RDFS } from './../../models/Vocabulary';
import { GraphMode } from './../abstractGraph';
import { ARTNode, ARTURIResource } from './../../models/ARTResources';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { PropInfo, UmlNode, NodePropRange } from '../model/UmlNode';
import { NodeMeasure } from './../model/Node';
import { AbstractGraphNode } from '../abstractGraphNode';

@Component({
    selector: '[umlNode]',
    templateUrl: './umlNodeComponent.html',
    styleUrls: ['../graph.css']
})
export class UmlNodeComponent extends AbstractGraphNode {
    @Input() graph: ForceDirectedGraph;
    @Input() selectedProp: NodePropRange;
    @Input('umlNode') node: UmlNode;
    @Output() propClicked: EventEmitter<PropInfo> = new EventEmitter<PropInfo>();
    @ViewChild('textEl') textElement: ElementRef;

    graphMode = GraphMode.umlOriented;

    private stripePercentage: number; //percentage of the rect height to dedicate to the top stripe
    private stripeHeight: number; //height (in px) of the top stripe
    protected measures: NodeMeasure;
    private res: ARTNode;
    private lineSeparetorPercentage: number;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef)
    }


    ngOnInit() {
        this.initNode();
        this.initMeasures();
        this.initPropCoord();
        this.updateShow();
    }

    protected initNode() {
        this.measures = this.node.getNodeMeaseure();
    }

    private initMeasures() {
        let fontSize: number = 14;
        let padding: number = 2;//distance between properties
        this.stripeHeight = fontSize + 2 * padding;
        /* Questo contatore mi serve a capire quante property di tipo subClassOf ci sono nel nodo in modo
         * da poter riddure l'altezza del rettangolo del numero di istanze trovate
         */
        let countsubClassOf: number = 0;
        for (let cord of this.node.listPropInfo) {
            if (cord.property.equals(RDFS.subClassOf)) {
                countsubClassOf++;
            }
        }
        // it updates the height of the rectangle based on the number of properties
        this.measures.height = this.stripeHeight + ((this.node.listPropInfo.length - countsubClassOf) * fontSize) + 5;
        this.stripePercentage = Math.ceil(this.stripeHeight * 100 / this.measures.height);
        // percentage of the separator line
        this.lineSeparetorPercentage = Math.ceil(1 * 100 / this.measures.height) + this.stripePercentage;
    }


    protected initPropCoord() {
        let i = 0;
        for (let prop of this.node.listPropInfo) {
            prop.show = ResourceUtils.getRendering(prop.property, this.rendering) + ": " + ResourceUtils.getRendering(prop.range, this.rendering);
            prop.normalizedShow = prop.show;
            if (prop.property.equals(RDFS.subClassOf)) {
                prop.x = -this.measures.width / 2 + 3;
                prop.y = -this.measures.height / 2 + 3;
            } else {
                prop.x = (-this.measures.width / 2 + 3);
                prop.y = -this.measures.height / 2 + this.stripeHeight + 5 + 14 * i;
                i++;
            }
        }
    }

    /**
     * This method is used to highlight the prop inside the node
     * @param prop 
     */

    private isSelectedProperty(prop: PropInfo) {
        return this.selectedProp != null && this.selectedProp.node.res.equals(this.node.res) && this.selectedProp.prop.property.equals(prop.property) && this.selectedProp.prop.range.equals(prop.range);
    }

    /**
     * This method is used in order to ensure RDFS.subClassOf is not shown among properties of node
     * @param prop 
     */
    private showPropSubClass(prop: PropInfo) {
        return !prop.property.equals(RDFS.subClassOf)
    }




    /**
    * This method update lenght properties inside node
    */

    //@override
    protected updateShow() {
        //update show class name
        this.show = ResourceUtils.getRendering(this.node.res, this.rendering);
        this.changeDetectorRef.detectChanges(); //fire change detection in order to update the textEl that contains "show"
        let dimImgClass = 14
        this.normalizedShow = this.show;
        if (this.textElement != null) {
            let textElementWidth = this.textElement.nativeElement.getBBox().width;
            let nodeWidth = this.node.getNodeWidth() - 4 - dimImgClass; //subtract 4 as padding
            if (textElementWidth > nodeWidth) {
                let ratio = textElementWidth / nodeWidth;
                let truncateAt = Math.floor(this.normalizedShow.length / ratio);
                this.normalizedShow = this.normalizedShow.substring(0, truncateAt);
            }
            if (this.show.length > this.normalizedShow.length) {
                this.normalizedShow = this.show.substring(0, this.normalizedShow.length - 3) + "...";
            }
        }
        //update show properties
        let dimImg = 12;
        for (let i = 0; i < this.node.listPropInfo.length; i++) {
            let p = this.node.listPropInfo[i];
            p.show = ResourceUtils.getRendering(p.property, this.rendering) + ": " + ResourceUtils.getRendering(p.range, this.rendering);
            p.normalizedShow = p.show;
            this.changeDetectorRef.detectChanges();
            let propTextEl = <SVGGraphicsElement><any>document.getElementById("propTextEl" + p.id);
            if (propTextEl != null) {
                let textElementWidth = propTextEl.getBBox().width;
                let nodeWidth = this.node.getNodeWidth() - 4 - dimImg; //subtract 4 as padding
                if (textElementWidth > nodeWidth) {
                    let ratio = textElementWidth / nodeWidth;
                    let truncateAt = Math.floor(p.normalizedShow.length / ratio);
                    p.normalizedShow = p.normalizedShow.substring(0, truncateAt);

                }
                if (p.show.length > p.normalizedShow.length) {
                    p.normalizedShow = p.show.substring(0, p.normalizedShow.length - 3) + "...";

                }
            }
        }
        this.changeDetectorRef.detectChanges(); //fire change detection in order to update the normalizedShow in the view
    }


    /**
     * Click handlers
     */

    protected onClickClass() {
        this.nodeClicked.emit(this.node);
    }

    /**
      * This method propagate click event on prop
      */
    private onClickProp(prop: PropInfo) {
        this.propClicked.emit(prop);
    }

}
