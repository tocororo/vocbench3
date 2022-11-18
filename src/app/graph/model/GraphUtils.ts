import { ARTNode, ARTURIResource } from "../../models/ARTResources";
import { Link } from "./Link";
import { Node, NodeShape } from "./Node";

export class GraphUtils {


    public static computeCenter(node1: Node, node2: Node): { x: number, y: number } {
        return {
            x: (node1.x + node2.x) / 2,
            y: (node1.y + node2.y) / 2
        };
    }

    public static calculateNormalVector(node1: Node, node2: Node, length: number) {
        let dx = node2.x - node1.x;
        let dy = node2.y - node1.y;

        let nx = -dy;
        let ny = dx;

        let vlength = Math.sqrt(nx * nx + ny * ny);

        let ratio = vlength !== 0 ? length / vlength : 0;

        return { "x": nx * ratio, "y": ny * ratio };
    }

    /**
     * Returns the coordinates (x, y) of the intersection point between the link line and the border of the target node
     */
    public static getIntersectionPoint(link: Link) {
        let targetShape: NodeShape = link.target.getNodeShape();
        if (targetShape == NodeShape.rect || targetShape == NodeShape.circle || targetShape == NodeShape.square || targetShape == NodeShape.octagon || targetShape == NodeShape.label) {
            let dx: number = link.target.x - link.source.x;
            let dy: number = link.target.y - link.source.y;

            let length: number = Math.sqrt(dx * dx + dy * dy);

            if (length === 0) { //avoid division per 0 when source and target are the same node
                return { x: link.source.x, y: link.source.y };
            }

            let innerDistance = this.distanceToBorder(dx, dy, link.target);

            let ratio = (length - innerDistance) / length;

            let x = dx * ratio + link.source.x;
            let y = dy * ratio + link.source.y;

            return { x: x, y: y };
        } else {
            return { x: link.target.x, y: link.target.y };
        }
    }

    /**
     * Returns the distance of the node border from the center
     * @param dx 
     * @param dy 
     * @param nodeShape 
     */
    private static distanceToBorder(dx: number, dy: number, node: Node) {
        let nodeShape: NodeShape = node.getNodeShape();
        if (nodeShape == NodeShape.rect || nodeShape == NodeShape.square || nodeShape == NodeShape.octagon || nodeShape == NodeShape.label) {
            let width = node.getNodeMeaseure().width;
            let height = node.getNodeMeaseure().height;
            let innerDistance;
            let m_link = Math.abs(dy / dx);
            let m_rect = height / width;

            if (m_link <= m_rect) {
                let timesX = dx / (width / 2);
                let rectY = dy / timesX;
                innerDistance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(rectY, 2));
            } else {
                let timesY = dy / (height / 2);
                let rectX = dx / timesY;
                innerDistance = Math.sqrt(Math.pow(height / 2, 2) + Math.pow(rectX, 2));
            }
            return innerDistance;
        } else { // if (nodeShape == NodeShape.circle) {
            return node.getNodeMeaseure().radius;
        }
    }

    /**
     * Check if two links are overlapped, namely if they link the same two nodes (source-target)
     * @param link1 
     * @param link2 
     */
    public static areLinksOverlapped(link1: Link, link2: Link) {
        return link1.source == link2.source && link1.target == link2.target ||
            link1.source == link2.target && link1.target == link2.source;
    }

    public static getNodeOfValue(nodes: Node[], value: ARTNode): Node {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].res.getNominalValue() == value.getNominalValue()) {
                return nodes[i];
            }
        }
        return null;
    }

    public static getLinksWithPredicate(links: Link[], value: ARTURIResource): Link[] {
        let linksWithPred: Link[] = [];
        for (let i = 0; i < links.length; i++) {
            if (links[i].res.getNominalValue() == value.getNominalValue()) {
                linksWithPred.push(links[i]);
            }
        }
        return linksWithPred;
    }


    /**
     * Con questo metodo regolo la posizione della freccia(la punta) rispetto al bordo del rettangolo(nodo).
     * Li regolo in base alla posizione del nodo sorgente e del nodo target e in base all'altezza del nodo
     * sorgente rispetto al nodo target
     */
    public static getArrowPosition(source: Point, target: Point, link: Link, isSubClassOf: boolean): ArrowPosition {
        let sign = Math.sign(source.x - target.x);// return 1 if positive and -1 if negative
        if (sign == 0) { // questo è il caso in cui le x di target e source sono uguali
            sign = -1; // gli assegno uno dei due a caso
        }
        let dx: number;
        let dy: number;
        let abs = Math.abs(source.y - target.y);//valore assoluto (lo uso per calcolarmi fino a che momento la freccia deve rimanere dritta)
        //caso freccia dritta(primi due if): sorgente a sinistra del target sign=1 e sorgente a destra del target sign=-1
        if ((sign === -1 && (((link.target.getNodeHeight() / 2) + 3) > abs))) { // qui il + 3 è per gestire la linea e la punta della freccia subito dopo che finisce di essere dritta la linea
            dx = (target.x - (link.target.getNodeWidth() / 2));
            dy = source.y;
            return { x: dx, y: dy, straightArrow: true };
        } else if ((sign === 1 && (((link.target.getNodeHeight() / 2) + 3) > abs))) {
            dx = (target.x + (link.target.getNodeWidth() / 2));
            dy = source.y;
            return { x: dx, y: dy, straightArrow: true };
        } else if (sign === -1 && source.y >= target.y) { // caso sorgente a sinistra e target a destra ( ma è più alto)
            dx = target.x;
            dy = (target.y + (link.target.getNodeHeight() / 2));
            if (isSubClassOf) { // nel caso di subClassOf voglio che la freccia esca sopra la classe sorgente 
                dx = target.x;
                dy = (target.y + (link.target.getNodeHeight() / 2));
                return { x: dx, y: dy, isSubClassOf: true };
            } else if (target.x >= (source.x + (link.source.getNodeWidth() / 2)) && target.x <= (source.x + link.source.getNodeWidth())) { // caso in cui la freccia esce a destra del sorgente(non può uscire da sopra) e si spezza due volte perchè il target si trova esattamente sopra di lui
                dx = source.x + link.source.getNodeWidth();
                return { x: dx, y: dy, directionRight: true };
            } else if (target.x <= (source.x + (link.source.getNodeWidth() / 2)) && target.x >= source.x) { // caso in cui la freccia esce a sinistra del sorgente(non può uscire da sopra) e si spezza due volte perchè il target si trova esattamente sopra di lui
                dx = source.x;
                return { x: dx, y: dy, directionLeft: true };
            }
            return { x: dx, y: dy };
        } else if (sign === 1 && source.y >= target.y) { // caso sorgente a destra e target a sinistra ( ma è più alto)
            dx = target.x;
            dy = (target.y + (link.target.getNodeHeight() / 2));
            if (isSubClassOf) { // nel caso di subClassOf voglio che la freccia esca sopra la classe sorgente 
                dx = target.x;
                dy = (target.y + (link.target.getNodeHeight() / 2));
                return { x: dx, y: dy, isSubClassOf: true };
            }
            return { x: dx, y: dy };
        } else if (sign === -1 && source.y < target.y) { // caso sorgente a sinistra e target a destra ( ma è più basso)
            dx = target.x;
            dy = (target.y - (link.target.getNodeHeight() / 2));
            if (isSubClassOf) { // nel caso di subClassOf voglio che la freccia esca sotto la classe sorgente 
                dx = target.x;
                dy = (target.y - (link.target.getNodeHeight() / 2));
                return { x: dx, y: dy, isSubClassOf: true };
            } else if (target.x >= (source.x + (link.source.getNodeWidth() / 2)) && target.x <= (source.x + link.source.getNodeWidth())) { // caso in cui la freccia esce a destra del sorgente(non può uscire da sopra) e si spezza due volte perchè il target si trova esattamente sotto di lui
                dx = source.x + link.source.getNodeWidth();
                return { x: dx, y: dy, directionRight: true };
            } else if (target.x <= (source.x + link.source.getNodeWidth() / 2) && target.x >= source.x) { // caso in cui la freccia esce a sinistra del sorgente(non può uscire da sopra) e si spezza due volte perchè il target si trova esattamente sotto di lui
                dx = source.x;
                return { x: dx, y: dy, directionLeft: true };
            }
            return { x: dx, y: dy };
        } else if (sign === 1 && source.y < target.y) { // caso sorgente a destra e target a sinistra ( ma è più basso)
            dx = target.x;
            dy = (target.y - (link.target.getNodeHeight() / 2));
            if (isSubClassOf) { // nel caso di subClassOf voglio che la freccia esca sotto la classe sorgente 
                dx = target.x;
                dy = (target.y - (link.target.getNodeHeight() / 2));
                return { x: dx, y: dy, isSubClassOf: true };
            }
            return { x: dx, y: dy };
        }

        /* 
        if this code is reached it means that none of the above cases handled the current scenario.
        This should never happend, anyway in such case I return the following object (just to prevent a sort of null pointer exception)
        */
        return { x: dx, y: dy, isSubClassOf: isSubClassOf };

    }

}

export class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export interface ArrowPosition {
    x: number;
    y: number;
    straightArrow?: boolean; //tells if the arrow should go straight (not a split line)
    directionLeft?: boolean; //tells if the arrow/link goes to the left
    directionRight?: boolean; //tells if the arrow/link goes to the right
    isSubClassOf?: boolean; //tells if the arrow is about a subClassOf relation
}