import { Link } from './../model/Link';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { RDFS } from './../../models/Vocabulary';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RDFResourceRolesEnum } from './../../models/ARTResources';
import { Constants } from './../model/GraphConstants';
import { GraphUtils, Point } from './../model/GraphUtils';
import { UmlLink } from './../model/UmlLink';
import { templateJitUrl } from '@angular/compiler';




@Component({ 
    selector: '[uml-link]',
    templateUrl: './umlLinkComponent.html',

    styleUrls: ['../graph.css']
})
export class UmlLinkComponent {
    @Output() linkClicked: EventEmitter<Link> = new EventEmitter<Link>();
    @Input('uml-link') link: UmlLink;
    @Input() selected: boolean = false;
    @ViewChild('textEl') textElement: ElementRef;
    @Input() isHideArrows: boolean;
    private withMarker: boolean = true
    private black: boolean = true;
    private white: boolean;
    private arrowClass: String = "";
   

    ngOnInit() {
        this.initLinkStyle();
    }


    private initLinkStyle() {
        if (this.link.res != null) {

            if (this.link.isReflexive()) {
                this.withMarker = false
                this.black = false
            }
            if (this.link.res.equals(RDFS.subClassOf)) {
                this.arrowClass = "subClassArrow";
                this.white = true
                this.withMarker = false
                this.black = false
            } else {
                let role: RDFResourceRolesEnum = this.link.getRole();
                this.arrowClass = role + "Arrow";

            }

        }

    }

    


    private computePathUml() {

        let source: Point = new Point(this.link.source.x, this.link.source.y);
        let target: Point = new Point(this.link.target.x, this.link.target.y);
        let isSubClassOf:boolean=false;
        //M is the starting point of the arrow line
        let path: string = "M" + source.x + " " + source.y; //path start
        if (this.link.loop && this.link.offset != 0) {
            let newCord: number = 0;
            for (let tmp of this.link.source.listPropInfo) {
                if (tmp.property.equals(this.link.res) && tmp.range.equals(this.link.target.res)) {
                    // il -3 è il padding che va dal lato del rettangolo fino all'inizio della proprietà
                    path = path + " " + "M" + (source.x + (tmp.x - 3)) + " " + (source.y + tmp.y + 9);
                    source.x = (source.x + (tmp.x - 3));
                    source.y = (source.y + tmp.y + 9);
                    path = path + " " + "L" + (source.x - 12) + " " + source.y;
                    source.x = (source.x - 12);
                    path = path + " " + "L" + source.x + " " + (source.y - 5);
                    path = path + " " + "L" + (source.x + 12) + " " + (source.y - 5);

                }
            }
        } else {

            for (let tmp of this.link.source.listPropInfo) {
                //CREARE UN METODO DEDICATO
                if (tmp.property.equals(this.link.res) && tmp.range.equals(this.link.target.res)) {
                    let endpoint;
                    if(tmp.property.equals(RDFS.subClassOf)){
                        isSubClassOf=true;
                    }
                    /*
                    from the center to the edge of the node (to bring the arrow out of the resource to which it refers).
                    the -3 is the padding that goes from the side of the rect to the beginning of the property
                    */
                    path = path + " " + "M" + (source.x + (tmp.x - 3)) + " " + (source.y + tmp.y + 7);
                    source.x = source.x + (tmp.x - 3);
                    source.y = source.y + tmp.y + 7;
                    //endpoint = GraphUtils.positionArrow(source, target, this.link );
                    endpoint = GraphUtils.positionArrow(source, target, this.link, isSubClassOf ); 
                    
                     if (endpoint.directionRight === true) {
                        path = path + " " + "M" + endpoint.x + " " + source.y;
                        path = path + " " + "L" + (endpoint.x + ((this.link.target.getNodeWidth()/2) + 5)) + " " + source.y
                        source.x = endpoint.x + (this.link.target.getNodeWidth()/2) + 5

                        path = path + " " + "L" + source.x + " " + this.link.target.y;
                        path = path + " " + "L" + (target.x + this.link.target.getNodeWidth() / 2) + " " + this.link.target.y;
                        return path;

                    } else if(endpoint.directionLeft === true){
                        path = path + " " + "M" + endpoint.x + " " + source.y;
                        path = path + " " + "L" + (endpoint.x - ((this.link.target.getNodeWidth()/2) + 5)) + " " + source.y
                        source.x = endpoint.x - ((this.link.target.getNodeWidth()/2) + 5)
                        path = path + " " + "L" + source.x + " " + this.link.target.y;
                        path = path + " " + "L" + (target.x - this.link.target.getNodeWidth() / 2) + " " + this.link.target.y;
                        return path;
                    }

                     if (endpoint.straightArrow === false || endpoint.isSubClassOf=== true ) {
                        path = path + " " + endpoint.x + " " + source.y;

                    }
                    path = path + " " + endpoint.x + " " + endpoint.y; //path end


                    // if (endpoint.direction === true) {
                    //     path = path + " " + "M" + endpoint.x + " " + source.y;
                    //     path = path + " " + "L" + (endpoint.x + this.link.target.getNodeWidth()) + " " + source.y
                    //     source.x = endpoint.x + this.link.target.getNodeWidth();

                    //     path = path + " " + "L" + source.x + " " + this.link.target.y;
                    //     path = path + " " + "L" + (target.x + this.link.target.getNodeWidth() / 2) + " " + this.link.target.y;
                    //     return path;

                    // }

                    // if (endpoint.tmp === false ) {
                    //     path = path + " " + endpoint.x + " " + source.y;

                    // }

                    // path = path + " " + endpoint.x + " " + endpoint.y; //path end

                }
            }
        }
        return path;
    }


    private onClick(event: Event) {
        event.stopPropagation(); //avoid propagation since click event is handled also in the svg container div
        if (this.link.res != null) {
            this.linkClicked.emit(this.link);
        }
    }




    /**
         * Link label utils
         */

    // private getLabelPosition() {
    //     let position: { x: number, y: number } = { x: 0, y: 0 };
    //     if (this.link.source == this.link.target) { //loop path
    //         let borderDistY = this.link.source.getNodeHeight() / 2;
    //         let sign = -1;
    //         //let sign = this.link.offset > 0 ? 1 : -1;
    //         let dy = (borderDistY + Math.abs(Constants.loopPathMultiplier * this.link.offset)) * sign;
    //         position.x = this.link.source.x;
    //         position.y = this.link.source.y + dy;
    //     } else { //"normal" path, the label is positioned in corrispondece of the control point of the curve
    //         let center = GraphUtils.computeCenter(this.link.source, this.link.target);
    //         let normal = GraphUtils.calculateNormalVector(this.link.source, this.link.target, Constants.normalVectorMultiplier * this.link.offset);
    //         position.x = center.x + normal.x;
    //         position.y = center.y + normal.y;
    //     }
    //     return position;
    // }

    // private getLabelTransform() {
    //     let labelPosition = this.getLabelPosition();
    //     return "translate(" + labelPosition.x + "," + labelPosition.y + ")";
    // }

    // private getLabelRectWidth() {
    //     let padding = 1;

    //     if (this.textElement != null) {

    //         return this.textElement.nativeElement.clientWidth + padding * 2;
    //     }
    //     return padding * 2;
    // }


}





