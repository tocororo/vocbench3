import { ARTNode, RDFResourceRolesEnum } from "../../models/ARTResources";
import { RDFS } from "../../models/Vocabulary";
import { Size } from "./GraphConstants";
import { Node, NodeShape } from "./Node";

export class ModelNode extends Node {

    /**
     * Both the following list are updated when adding or removing a link where source or target node is the current one.
     * This list are useful in order to know whenever a node is pending after the removal of a link
     */
    incomingNodes: Node[]; //list of node linked to this by an incoming link
    outgoingNodes: Node[]; //list of node linked to this by an outgoing link
    
    constructor(res: ARTNode) {
        super(res);
        this.incomingNodes = [];
        this.outgoingNodes = [];
    }

    initNodeShape() {
        /**
         * conceptScheme: square
         * collection (any kind) => square
         * individual: octagon
         * property (any kind) => rectangle
         * rdfs:Literal: rect (different sizes)
         * xLabel: label (custom shape)
         */
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
            } else if (role == RDFResourceRolesEnum.cls) {
                this.shape = NodeShape.circle;
                if (this.res.equals(RDFS.literal)) { //special case
                    this.shape = NodeShape.rect;
                }
            } else { //none of the previous => set circle as default
                this.shape = NodeShape.circle;
            }
        } else { //literal
            this.shape = NodeShape.rect;
        }
    }

    initNodeMeasure() {
        let shape = this.getNodeShape(); //do not access this.shape directly in order to be sure that it is initialized
        if (shape == NodeShape.circle) {
            this.measures = { radius: Size.Circle.radius };
        } else if (shape == NodeShape.rect) {
            if (this.res.equals(RDFS.literal)) { //rdfs:Literal rect in modelGraph is rendered smaller
                this.measures = { width: 60, height: 30 };
            } else {
                this.measures = { width: Size.Rectangle.base, height: Size.Rectangle.height };
            }
        } else if (shape == NodeShape.square) {
            this.measures = { width: Size.Square.side, height: Size.Square.side };
        } else if (shape == NodeShape.label) {
            this.measures = { width: Size.Label.base, height: Size.Label.height }
        } else if (shape == NodeShape.octagon) {
            this.measures = { width: Size.Octagon.base, height: Size.Octagon.height }
        }

    }

    removeIncomingNode(node: Node) {
        this.incomingNodes.splice(this.incomingNodes.indexOf(node), 1);
    }
    removeOutgoingNode(node: Node) {
        this.outgoingNodes.splice(this.outgoingNodes.indexOf(node), 1);
    }
    

}