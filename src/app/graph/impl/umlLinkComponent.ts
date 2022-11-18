import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { RDFResourceRolesEnum } from './../../models/ARTResources';
import { RDFS } from './../../models/Vocabulary';
import { ArrowPosition, GraphUtils, Point } from './../model/GraphUtils';
import { Link } from './../model/Link';
import { UmlLink } from './../model/UmlLink';




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
    withMarker: boolean = true;
    black: boolean = true;
    white: boolean;
    arrowClass: string = "";


    ngOnInit() {
        this.initLinkStyle();
    }


    private initLinkStyle() {
        if (this.link.res != null) {

            if (this.link.isReflexive()) {
                this.withMarker = false;
                this.black = false;
            }
            if (this.link.res.equals(RDFS.subClassOf)) {
                this.arrowClass = "subClassArrow";
                this.white = true;
                this.withMarker = false;
                this.black = false;
            } else {
                let role: RDFResourceRolesEnum = this.link.getRole();
                this.arrowClass = role + "Arrow";

            }

        }

    }

    computePathUml() {

        let source: Point = new Point(this.link.source.x, this.link.source.y);
        let target: Point = new Point(this.link.target.x, this.link.target.y);
        let isSubClassOf: boolean = false;
        //M is the starting point of the arrow line
        let path: string = "M" + source.x + " " + source.y; //path start
        if (this.link.loop && this.link.offset != 0) {
            for (let tmp of this.link.source.listPropInfo) {
                if (tmp.property.equals(this.link.res) && tmp.range.equals(this.link.target.res)) {
                    // il -3 è il padding che va dal lato del rettangolo fino all'inizio della proprietà
                    path = path + " M" + (source.x + (tmp.x - 3)) + " " + (source.y + tmp.y + 9);
                    source.x += (tmp.x - 3);
                    source.y = (source.y + tmp.y + 9);
                    path = path + " L" + (source.x - 12) + " " + source.y;
                    source.x -= 12;
                    path = path + " L" + source.x + " " + (source.y - 5);
                    path = path + " L" + (source.x + 12) + " " + (source.y - 5);

                }
            }
        } else {
            //retrieve the PropInfo of the source node related to the current link
            let propInfo = this.link.source.listPropInfo.find(pi => {
                return pi.property.equals(this.link.res) && pi.range.equals(this.link.target.res);
            });
            if (propInfo != null) { //found
                let endpoint: ArrowPosition;
                if (propInfo.property.equals(RDFS.subClassOf)) {
                    isSubClassOf = true;
                }
                /*
                from the center to the edge of the node (to bring the arrow out of the resource to which it refers).
                the -3 is the padding that goes from the side of the rect to the beginning of the property
                */
                path = path + " M" + (source.x + (propInfo.x - 3)) + " " + (source.y + propInfo.y + 7);
                source.x += (propInfo.x - 3);
                source.y = source.y + propInfo.y + 7;
                endpoint = GraphUtils.getArrowPosition(source, target, this.link, isSubClassOf);

                if (endpoint.directionRight) {
                    path = path + " M" + endpoint.x + " " + source.y;
                    path = path + " L" + (endpoint.x + ((this.link.target.getNodeWidth() / 2) + 5)) + " " + source.y;
                    source.x = endpoint.x + (this.link.target.getNodeWidth() / 2) + 5;

                    path = path + " L" + source.x + " " + this.link.target.y;
                    path = path + " L" + (target.x + this.link.target.getNodeWidth() / 2) + " " + this.link.target.y;
                    return path;

                } else if (endpoint.directionLeft) {
                    path = path + " M" + endpoint.x + " " + source.y;
                    path = path + " L" + (endpoint.x - ((this.link.target.getNodeWidth() / 2) + 5)) + " " + source.y;
                    source.x = endpoint.x - ((this.link.target.getNodeWidth() / 2) + 5);
                    path = path + " L" + source.x + " " + this.link.target.y;
                    path = path + " L" + (target.x - this.link.target.getNodeWidth() / 2) + " " + this.link.target.y;
                    return path;
                }

                if (!endpoint.straightArrow || endpoint.isSubClassOf) {
                    path = path + " " + endpoint.x + " " + source.y;

                }
                path = path + " " + endpoint.x + " " + endpoint.y; //path end
            }
        }
        return path;
    }


    onClick(event: Event) {
        event.stopPropagation(); //avoid propagation since click event is handled also in the svg container div
        if (this.link.res != null) {
            this.linkClicked.emit(this.link);
        }
    }

}





