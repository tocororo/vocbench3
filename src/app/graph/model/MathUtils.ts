import { GraphMode } from "../abstractGraph";
import { Size } from "./GraphConstants";
import { Link } from "./Link";
import { Node, NodeShape } from "./Node";

export class MathUtils {


    public static computeCenter(node1: Node, node2: Node): { x: number, y: number } {
        return {
            x: (node1.x + node2.x) / 2,
			y: (node1.y + node2.y) / 2
        }
    }

    public static calculateNormalVector(node1: Node, node2: Node, length: number) {
		let dx = node2.x - node1.x;
		let dy = node2.y - node1.y;

		let nx = -dy;
		let ny = dx;

		var vlength = Math.sqrt(nx * nx + ny * ny);

		var ratio = vlength !== 0 ? length / vlength : 0;

		return {"x": nx * ratio, "y": ny * ratio};
    };
    
    /**
     * Returns the coordinates (x, y) of the intersection point between the link line and the border of the target node
     */
    public static getIntersectionPoint(link: Link, graphMode: GraphMode) {
        let targetShape: NodeShape = link.target.getNodeShape(graphMode);
        if (targetShape == NodeShape.rect || targetShape == NodeShape.circle || targetShape == NodeShape.square || targetShape == NodeShape.octagon || targetShape == NodeShape.label) {
            let dx: number = link.target.x - link.source.x;
            let dy: number = link.target.y - link.source.y;

            let length: number = Math.sqrt(dx * dx + dy * dy);

            if (length === 0) { //avoid division per 0 when source and target are the same node
                return {x: link.source.x, y: link.source.y};
            }

            let innerDistance = this.distanceToBorder(dx, dy, targetShape);

            let ratio = (length - innerDistance) / length;

            let x = dx * ratio + link.source.x;
            let y = dy * ratio + link.source.y;

            return {x: x, y: y};
        } else {
            return { x: link.target.x, y: link.target.y }
        }
    }

    /**
     * Returns the distance of the node border from the center
     * @param dx 
     * @param dy 
     * @param nodeShape 
     */
    private static distanceToBorder(dx: number, dy: number, nodeShape: NodeShape) {
        if (nodeShape == NodeShape.rect || nodeShape == NodeShape.square || nodeShape == NodeShape.octagon || nodeShape == NodeShape.label) {
            let width = Size.Rectangle.base;
            let height = Size.Rectangle.height;
            if (nodeShape == NodeShape.square) {
                width = height = Size.Square.side;
            } else if (nodeShape == NodeShape.octagon) {
                width = Size.Octagon.base;
                height = Size.Octagon.height;
            } else if (nodeShape == NodeShape.label) {
                width = Size.Label.base;
                height = Size.Label.height;
            }

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
        } else if (nodeShape == NodeShape.circle) {
            return Size.Circle.radius;
        }
    }

    public static getNodeHeight(nodeShape: NodeShape) {
        if (nodeShape == NodeShape.circle) {
            return Size.Circle.radius * 2;
        } else if (nodeShape == NodeShape.label) {
            return Size.Label.height;
        } else if (nodeShape == NodeShape.octagon) {
            return Size.Octagon.height;
        } else if (nodeShape == NodeShape.rect) {
            return Size.Rectangle.height;
        } else if (nodeShape == NodeShape.square) {
            return Size.Square.side;
        }
    }

    public static getNodeWidth(nodeShape: NodeShape) {
        if (nodeShape == NodeShape.circle) {
            return Size.Circle.radius * 2;
        } else if (nodeShape == NodeShape.label) {
            return Size.Label.base;
        } else if (nodeShape == NodeShape.octagon) {
            return Size.Octagon.base;
        } else if (nodeShape == NodeShape.rect) {
            return Size.Rectangle.base;
        } else if (nodeShape == NodeShape.square) {
            return Size.Square.side;
        }
    }

}