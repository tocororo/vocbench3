import { Size } from './../model/GraphConstants';
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
    // private lineSeparetorPercentage: number;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef)
    }


    ngOnInit() {
        this.initNode();
        this.initMeasures();
        //this.initPropCoord();
    }

    /** 
     * @Override
     *  Required because updateShow() modifies rect width and so initPropCoord initialises
     *  prop cordinates on the rect width update.
    */
    ngAfterViewInit() {
        this.updateShow();
        this.initPropCoord();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rendering'] && !changes['rendering'].firstChange) {
            this.updateShowImpl(true);
        }
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
        // this.lineSeparetorPercentage = Math.ceil(1 * 100 / this.measures.height) + this.stripePercentage;
    }


    protected initPropCoord() {
        let i = 0;
        for (let prop of this.node.listPropInfo) {
            // prop.show = ResourceUtils.getRendering(prop.property, this.rendering) + ": " + ResourceUtils.getRendering(prop.range, this.rendering);
            // prop.normalizedShow = prop.show;
            if (prop.property.equals(RDFS.subClassOf)) {
                prop.x = -this.measures.width / 2 + 3; // padding left-side
                prop.y = -this.measures.height / 2 + 3;
            } else {
                prop.x = (-this.measures.width / 2 + 3);// padding left-side
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
     * This method update lenght properties inside node and class name.
     * Update also width rect.
     */

    //@override
    protected updateShow() {
        this.updateShowImpl(false)
    }

    private updateShowImpl(renderingChange: boolean) {
        let localName = "";
        let nodeWidth = 0;
        let localNameRange = "";
        let localNameProp = "";
        //update show class name
        this.show = ResourceUtils.getRendering(this.node.res, this.rendering);
        this.changeDetectorRef.detectChanges(); //fire change detection in order to update the textEl that contains "show"
        let dimImgClass = 14
        this.normalizedShow = this.show;
        // take localName from uri off
        for (let i = this.show.length; i >= 0; i--) {
            if ((this.show[i] == "/" || this.show[i] == "#") && this.show.startsWith("htt")) {
                localName = this.show.substring(this.show.length, i)
                break;
            }
        }
        if (this.textElement != null) {
            let textElementWidth = this.textElement.nativeElement.getBBox().width;
            nodeWidth = this.measures.width - 6 - dimImgClass; //subtract 6(3 right-side and 3 left-side) as padding 
            if (textElementWidth > nodeWidth) {
                //230= 250(max width decided) - 20(6 padding, 14 img)
                if (textElementWidth > 230) {
                    let ratio = textElementWidth / nodeWidth;
                    let truncateAt = Math.floor(this.normalizedShow.length / ratio);
                    this.normalizedShow = this.normalizedShow.substring(0, truncateAt);
                    if (this.show.length > this.normalizedShow.length) {
                        this.normalizedShow = this.normalizedShow.substring(0, this.normalizedShow.length - (3 + localName.length)) + "..." + localName;
                    }
                    if (!renderingChange) {
                        this.measures.width = 250
                    }

                } else {// textElementWidth <= 230) 
                    let extraRightSide = textElementWidth - this.measures.width;
                    if (!renderingChange) {
                        this.measures.width = this.measures.width + extraRightSide + 6 + dimImgClass;
                    } else {
                        let ratio = textElementWidth / nodeWidth;
                        let truncateAt = Math.floor(this.normalizedShow.length / ratio);
                        this.normalizedShow = this.normalizedShow.substring(0, truncateAt);
                        if (this.show.length > this.normalizedShow.length) {
                            this.normalizedShow = this.normalizedShow.substring(0, this.normalizedShow.length - (3 + localName.length)) + "..." + localName;
                        }

                    }
                }
            }
        }

        //update show properties
        let dimImg = 12;
        for (let i = 0; i < this.node.listPropInfo.length; i++) {
            if (!this.node.listPropInfo[i].property.equals(RDFS.subClassOf)) {
                let p = this.node.listPropInfo[i];
                let property = ResourceUtils.getRendering(p.property, this.rendering)
                // take localName from Prop off
                for (let i = property.length; i >= 0; i--) {
                    if ((property[i] == "/" || property[i] == "#") && property.startsWith("htt")) {
                        localNameProp = property.substring(property.length, i)
                        break;
                    }
                }
                let range = ResourceUtils.getRendering(p.range, this.rendering);
                // take localName from Range off
                for (let i = range.length; i >= 0; i--) {
                    if ((range[i] == "/" || range[i] == "#") && range.startsWith("htt")) {
                        localNameRange = range.substring(range.length, i)
                        break;
                    }
                }
                p.show = ResourceUtils.getRendering(p.property, this.rendering) + ": " + ResourceUtils.getRendering(p.range, this.rendering);
                p.normalizedShow = p.show;
                this.changeDetectorRef.detectChanges();
                let propTextEl = <SVGGraphicsElement><any>document.getElementById("propTextEl" + p.id);
                if (propTextEl != null) {
                    let textElementWidth = propTextEl.getBBox().width;
                    let nodeWidth = this.measures.width - 6 - dimImg - 10; //subtract 6(3 right-side and 3 left-side) as padding whereas 10 is a random value to fix pixel dimension when strings come out from rect right side
                    if (textElementWidth > nodeWidth) {
                        if (textElementWidth > 222) {
                            let ratio = textElementWidth / nodeWidth;
                            let truncateAt = Math.floor(p.normalizedShow.length / ratio);
                            p.normalizedShow = p.normalizedShow.substring(0, truncateAt);
                            if (p.show.length > p.normalizedShow.length) {
                                p.normalizedShow = p.show.substring(0, p.normalizedShow.length - (3 + localNameRange.length)) + "..." + localNameRange;

                            }
                            if (!renderingChange) {
                                this.measures.width = 250
                            }
                        } else { //textElementWidth <= 222
                            let extraRightSide = textElementWidth - this.measures.width;
                            if (!renderingChange) {
                                this.measures.width = this.measures.width + extraRightSide + 6 + dimImg + 10;
                            } else {
                                let ratio = textElementWidth / nodeWidth;
                                let truncateAt = Math.floor(p.normalizedShow.length / ratio);
                                p.normalizedShow = p.normalizedShow.substring(0, truncateAt);
                                if (p.show.length > p.normalizedShow.length) {
                                    p.normalizedShow = p.show.substring(0, p.normalizedShow.length - (3 + localNameRange.length)) + "..." + localNameRange;

                                }
                            }

                        }
                    }
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
