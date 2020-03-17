import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractGraphNode } from '../abstractGraphNode';
import { NodePropRange, PropInfo, UmlNode } from '../model/UmlNode';
import { ARTNode } from './../../models/ARTResources';
import { RDFS } from './../../models/Vocabulary';
import { ResourceUtils } from './../../utils/ResourceUtils';
import { GraphMode } from './../abstractGraph';
import { ForceDirectedGraph } from './../model/ForceDirectedGraph';
import { NodeMeasure } from './../model/Node';

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
     * This method update the show of the node(class-name,width-rect,properties).
     */

    //@override
    protected updateShow() {
        this.updateShowImpl(false)
    }

    private updateShowImpl(renderingChange: boolean) {
        let localName = "";
        let nodeWidth = 0;
        let property = "";
        let range = "";
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
                    nodeWidth = 230
                    let ratio = textElementWidth / nodeWidth;
                    let truncateAt = Math.floor(this.normalizedShow.length / ratio);
                    this.normalizedShow = this.normalizedShow.substring(0, truncateAt);
                    if (this.show.length > this.normalizedShow.length) {
                        this.normalizedShow = this.normalizedShow.substring(0, this.normalizedShow.length - (3 + localName.length)) + "..." + localName;
                    }
                    if (!renderingChange) {
                        this.measures.width = 250
                    }
                    nodeWidth = this.measures.width - 6 - dimImgClass;

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
                property = ResourceUtils.getRendering(p.property, this.rendering)
                // take localName from Prop off
                for (let i = property.length; i >= 0; i--) {
                    if ((property[i] == "/" || property[i] == "#") && property.startsWith("htt")) {
                        localNameProp = property.substring(property.length, i)
                        break;
                    }
                }
                range = ResourceUtils.getRendering(p.range, this.rendering);
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
                            if (!renderingChange) {
                                this.measures.width = 250
                            }
                            nodeWidth = this.measures.width - 6 - dimImg - 10;
                            let ratio = textElementWidth / nodeWidth;
                            let truncateAt = Math.floor(p.normalizedShow.length / ratio);
                            let propLenght = this.updatePropLenght(property, range, truncateAt, localNameProp, localNameRange);
                            property = propLenght.property;
                            range = propLenght.range;
                            p.normalizedShow = property + ": " + range;
                            // console.log(p.normalizedShow)
                            // console.log("lenght", p.normalizedShow.length)
                            // p.normalizedShow = p.normalizedShow.substring(0, truncateAt);
                            // if (p.show.length > p.normalizedShow.length) {
                            //     p.normalizedShow = p.show.substring(0, p.normalizedShow.length - (3 + localNameRange.length)) + "..." + localNameRange;

                            // }

                        } else { //textElementWidth <= 222
                            let extraRightSide = textElementWidth - this.measures.width;
                            if (!renderingChange) {
                                this.measures.width = this.measures.width + extraRightSide + 6 + dimImg + 10;
                            } else {
                                let ratio = textElementWidth / nodeWidth;
                                let truncateAt = Math.floor(p.normalizedShow.length / ratio);
                                let propLenght = this.updatePropLenght(property, range, truncateAt, localNameProp, localNameRange)
                                property = propLenght.property;
                                range = propLenght.range;
                                p.normalizedShow = property + ": " + range;
                                // p.normalizedShow = p.normalizedShow.substring(0, truncateAt);
                                // if (p.show.length > p.normalizedShow.length) {
                                //     p.normalizedShow = p.show.substring(0, p.normalizedShow.length - (3 + localNameRange.length)) + "..." + localNameRange;

                                // }
                            }

                        }
                    }
                }
            }
        }
        this.changeDetectorRef.detectChanges(); //fire change detection in order to update the normalizedShow in the view
    }


    /**
     * This method update lenghts of property and range inside node
    */

    private updatePropLenght(property: string, range: string, truncateAt: number, localNameProp: string, localNameRange: string): { property: string, range: string } {
        if (property.length < range.length) {
            let newTruncateAt = Math.floor(truncateAt / 3); // total space = 3/3 so property has 1/3 and range 2/3
            if (property.length <= newTruncateAt) {
                let addSpaceToRange = newTruncateAt - property.length
                newTruncateAt = (newTruncateAt * 2) + addSpaceToRange // calculate for the range
            } else {
                property = property.substring(0, newTruncateAt);
                if (property.length > localNameProp.length) {
                    property = property.substring(0, property.length - (3 + localNameProp.length)) + "..." + localNameProp;
                } else if (property.length == localNameProp.length) {
                    property = localNameProp
                } else {
                    property = localNameProp
                    if (property.length > 3) {
                        property = property.substring(0, property.length - 3) + "...";
                    } else if (property.length == 3) {
                        property = property.substring(0, property.length - 2) + "..";
                    } else if (property.length == 2) {
                        property = property.substring(0, property.length - 1) + ".";
                    }
                }
                newTruncateAt = (newTruncateAt * 2); // calculate for the range
            }
            if (range.length > newTruncateAt - 2) {  // -2 is for added " :" between property and range 
                range = range.substring(0, newTruncateAt - 2);
                if (range.length > localNameRange.length) {
                    range = range.substring(0, (newTruncateAt - 2) - (3 + localNameRange.length)) + "..." + localNameRange;
                } else if (range.length == localNameRange.length) {
                    range = localNameRange
                } else {
                    range = localNameRange
                    if (range.length > 3) {
                        range = range.substring(0, range.length - 3) + "...";
                    } else if (range.length == 3) {
                        range = range.substring(0, range.length - 1) + ".";
                    } else if (range.length == 2) {
                        range = range.substring(0, range.length - 1) + ".";
                    }
                }

            }

        } else if (property.length == range.length) {
            let newTruncateAt = Math.floor(truncateAt / 2); // total space = 2/2 so property has 1/2 and range 1/2
            if (property.length > newTruncateAt && range.length > newTruncateAt) {
                property = property.substring(0, newTruncateAt);
                range = property.substring(0, newTruncateAt - 2);
                if (property.length > localNameProp.length) {
                    property = property.substring(0, property.length - (3 + localNameProp.length)) + "..." + localNameProp;
                } else if (property.length == localNameProp.length) {
                    property = localNameProp
                } else {
                    property = localNameProp
                    if (property.length > 3) {
                        property = property.substring(0, property.length - 3) + "...";
                    } else if (property.length == 3) {
                        property = property.substring(0, property.length - 2) + "..";
                    } else if (property.length == 2) {
                        property = property.substring(0, property.length - 1) + ".";
                    }
                }

                if (range.length > localNameRange.length) {
                    range = range.substring(0, range.length - (3 + localNameRange.length)) + "..." + localNameRange;
                } else if (range.length == localNameRange.length) {
                    range = localNameRange
                } else {
                    range = localNameRange
                    if (range.length > 3) {
                        range = range.substring(0, range.length - 3) + "...";
                    } else if (range.length == 3) {
                        range = range.substring(0, range.length - 2) + "..";
                    } else if (range.length == 2) {
                        range = range.substring(0, range.length - 1) + ".";
                    }
                }
            }

        } else {
            let newTruncateAt = Math.floor(truncateAt / 3); // total space = 3/3 so property has 2/3 and range 1/3
            if (range.length <= newTruncateAt) { // first calculate range so can see if there is space to add to property
                let addSpaceToProperty = newTruncateAt - range.length
                newTruncateAt = (newTruncateAt * 2) + addSpaceToProperty // calculate for the property
            } else {
                range = range.substring(0, newTruncateAt);
                if (range.length > localNameRange.length) {
                    range = range.substring(0, range.length - (3 + localNameRange.length)) + "..." + localNameRange;
                } else if (range.length == localNameRange.length) {
                    range = localNameRange;
                } else {
                    range = localNameRange;
                    if (range.length > 3) {
                        range = range.substring(0, range.length - 3) + "...";
                    } else if (range.length == 3) {
                        range = range.substring(0, range.length - 2) + "..";
                    } else if (range.length == 2) {
                        range = range.substring(0, range.length - 1) + ".";
                    }
                }
                newTruncateAt = (newTruncateAt * 2); // calculate for the property
            }
            if (property.length > newTruncateAt - 2) {  //-2 is for added ": "
                property = property.substring(0, newTruncateAt - 2);
                if (property.length > localNameProp.length) {
                    property = property.substring(0, (newTruncateAt - 2) - (3 + localNameProp.length)) + "..." + localNameProp;
                } else if (property.length == localNameProp.length) {
                    property = localNameProp
                } else {
                    property = localNameProp
                    if (property.length > 3) {
                        property = property.substring(0, property.length - 3) + "...";
                    } else if (property.length == 3) {
                        property = property.substring(0, property.length - 1) + ".";
                    } else if (property.length == 2) {
                        property = property.substring(0, property.length - 1) + ".";
                    }
                }

            }
        }
        return { property: property, range: range }
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
