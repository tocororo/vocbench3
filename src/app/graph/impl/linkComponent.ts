import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RDFResourceRolesEnum } from '../../models/ARTResources';
import { GraphMode } from '../abstractGraph';
import { Constants } from '../model/GraphConstants';
import { Link } from '../model/Link';
import { MathUtils } from '../model/MathUtils';

@Component({
    selector: '[link]',
    templateUrl: "./linkComponent.html",
    styleUrls: ['../graph.css']
})
export class LinkComponent {
    @Input('link') link: Link;
    @Input() mode: GraphMode;

    @ViewChild('textEl') textElement: ElementRef;

    private linkClass: string = "";
    private arrowClass: string = "";
    private dashed: boolean = false;

    private showLabel: boolean = false;

    ngOnInit() {
        this.initLinkStyle();
    }

    private initLinkStyle() {
        if (this.link.predicate != null) {
            //distinguish the type or predicate
            let role: RDFResourceRolesEnum = this.link.predicate.getRole();
            this.linkClass = role+"Link";
            this.arrowClass = role+"Arrow";
            if (role == RDFResourceRolesEnum.objectProperty) {
                this.dashed = true;
            }
        }
    }

    /**
     * Compute the coordinates for the "d" attributes of the path
     */
    private computePath() {
        let path: string = "M" + this.link.source.x + " " + this.link.source.y; //path start
        if (this.link.source == this.link.target) { //loop path
            let dy = MathUtils.getNodeHeight(this.link.source.getNodeShape(this.mode)) / 2;
            path = path + " c -30 -" + (dy+30) + " 20 -" + (dy+30); //control points for curve dx1 dy1 dx2 dy2;
            path = path + " 10 -" + dy; //endpoint of the curve
        } else {
            let endpoint = MathUtils.getIntersectionPoint(this.link, this.mode);
            if (this.link.offset != 0) { //in case the offset, compute the control point for the Quadratic Bezier curve
                let center = MathUtils.computeCenter(this.link.source, this.link.target);
                let normal = MathUtils.calculateNormalVector(this.link.source, this.link.target, Constants.normalVectorMultiplier*this.link.offset);
                let controlPointX = center.x + normal.x;
                let controlPointY = center.y + normal.y;
                path = path + " Q" + controlPointX + " " + controlPointY;
            }
            path = path + " " + endpoint.x + " " + endpoint.y; //path end
        }
        return path;
    }


    /**
     * Link label utils
     */

    private getLabelPosition() {
        let center = MathUtils.computeCenter(this.link.source, this.link.target);
        let normal = MathUtils.calculateNormalVector(this.link.source, this.link.target, Constants.normalVectorMultiplier*this.link.offset);
        let controlPointX = center.x + normal.x;
        let controlPointY = center.y + normal.y;
        return { x: controlPointX, y: controlPointY };
    }

    private getLabelTransform() {
        let labelPosition = this.getLabelPosition();
        return "translate(" + labelPosition.x + "," + labelPosition.y + ")";
    }

    private getLabelRectWidth() {
        // console.log("this.textElement null?", (this.textElement == null))
        let padding = 2;
        if (this.textElement != null) {
            return this.textElement.nativeElement.clientWidth  + padding*2;
        }
        return padding*2;
    }

}