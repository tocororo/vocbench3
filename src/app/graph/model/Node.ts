import { ARTNode, RDFResourceRolesEnum } from "../../models/ARTResources";
import { Size } from "./GraphConstants";
import { GraphMode } from "../abstractGraph";

export class Node implements d3.SimulationNodeDatum {
    
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;

    res: ARTNode;

    private shape: NodeShape;
    
    constructor(res: ARTNode) {
        this.res = res;
    }

    getNodeShape(graphMode: GraphMode): NodeShape {
        if (this.shape == null) { //initialize only if not yet done
            if (graphMode == GraphMode.dataOriented) {
                this.shape = NodeShape.rect;
            } else {
                this.shape = NodeShape.circle;
                if (this.res.isResource()) {
                    let role: RDFResourceRolesEnum = this.res.getRole();
                    if (role == RDFResourceRolesEnum.annotationProperty ||
                        role == RDFResourceRolesEnum.datatypeProperty ||
                        role == RDFResourceRolesEnum.objectProperty ||
                        role == RDFResourceRolesEnum.ontologyProperty ||
                        role == RDFResourceRolesEnum.property
                    ) {
                        this.shape = NodeShape.rect;
                    } else if (
                        role == RDFResourceRolesEnum.conceptScheme ||
                        role == RDFResourceRolesEnum.skosCollection ||
                        role == RDFResourceRolesEnum.skosOrderedCollection
                    ) {
                        this.shape = NodeShape.square;
                    } else if (
                        role == RDFResourceRolesEnum.individual ||
                        role == RDFResourceRolesEnum.limeLexicon ||
                        role == RDFResourceRolesEnum.ontolexForm ||
                        role == RDFResourceRolesEnum.ontolexLexicalEntry ||
                        role == RDFResourceRolesEnum.ontolexLexicalSense
                    ) {
                        this.shape = NodeShape.octagon;
                    } else if (role == RDFResourceRolesEnum.xLabel) {
                        this.shape = NodeShape.label;
                    }
                } else { //literal
                    this.shape = NodeShape.rect;
                }
            }
        }
        return this.shape;
    }

}

export enum NodeShape {
    circle = "circle",
    octagon = "octagon",
    label = "label",
    rect = "rect",
    square = "square"
}