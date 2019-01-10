import { EventEmitter } from "@angular/core";
import * as d3 from "d3";
import { ARTNode } from "../../models/ARTResources";
import { Size } from "./GraphConstants";
import { GraphUtils } from "./GraphUtils";
import { Link } from "./Link";
import { Node } from "./Node";

export class ForceDirectedGraph {
    public ticker: EventEmitter<d3.Simulation<Node, Link>> = new EventEmitter(); //at every tick of the simulation, emits an event
    public simulation: d3.Simulation<any, any>;

    public options: GraphOptions;

    public nodes: Node[] = [];
    public links: Link[] = [];

    constructor(nodes: Node[], links: Link[]) {
        this.nodes = nodes;
        this.links = links;
    }

    public initSimulation(options: GraphOptions) {
        this.options = options;

        //Creating the simulation
        if (!this.simulation) {
            const ticker = this.ticker;

            // Creating the force simulation and defining the charges
            this.simulation = d3.forceSimulation();
            //init forces
            this.simulation.force("center", d3.forceCenter(this.options.width / 2, this.options.height / 2))
            this.simulation.force("charge", d3.forceManyBody());
            this.simulation.force("collide", d3.forceCollide());
            this.simulation.force('link', d3.forceLink());

            // Connecting the d3 ticker to an angular event emitter
            this.simulation.on('tick', function () {
                ticker.emit(this);
            });
        }
        this.update();
    }

    public update() {
        this.initNodes();
        this.initLinks();
        this.updateForces();
    }

    public updateForces() {
        let chargeForce: d3.ForceManyBody<{}> = this.simulation.force('charge'); //repulsion (if strength negative), attraction (if positive) among nodes
        chargeForce
            .strength(this.options.forces.charge.strength) 
            // .distanceMin(this.options.forces.charge.distanceMin)
            // .distanceMax(this.options.forces.charge.distanceMax);
        
        let collideForce: d3.ForceCollide<{}> = this.simulation.force('collide'); //avoid collision between nodes in the given radius
        collideForce
            .strength(this.options.forces.collide.strength)
            .radius(this.options.forces.collide.radius);

        let linkForce: d3.ForceLink<{}, Link> = this.simulation.force('link');
        linkForce
            .strength(this.options.forces.link.strength)
            .distance(this.options.forces.link.distance);

        this.simulation.alpha(0.5).restart();
    }

    private initNodes() {
        this.simulation.nodes(this.nodes);
    }
    private initLinks() {
        /**
         * If predicates for links are provided, there could be multiple links with same source-target but different predicate.
         * Here I collect links with the same source-target and set an offset for them,
         * so they will be rendered with different x,y coordinates (not overlapping each other).
         */
        if (this.links.length > 0 && this.links[0].predicate != null) {
            //resets all the offsets: useful since once the links are changed, some links could be no more overlapped
            this.links.forEach(l => l.offset = 0);

            let yetOverlapped: Link[] = []; //links already considered among the overlapped
            for (let i = 0; i < this.links.length; i++) {
                let link1: Link = this.links[i];
                if (yetOverlapped.indexOf(link1) != -1) continue; //link already considered as overlapped
                let overlappingLinks: Link[] = []; //collects links overlapping link1
                for (let j = i+1; j < this.links.length; j++) {
                    let link2: Link = this.links[j];
                    if (GraphUtils.areLinksOverlapped(link1, link2)) {
                        yetOverlapped.push(link2);
                        overlappingLinks.push(link2);
                    }
                }
                if (overlappingLinks.length > 0) { //there are links overlapping link1
                    yetOverlapped.push(link1);
                    overlappingLinks.push(link1);
                    let shift = Math.floor(overlappingLinks.length / 2);
                    for (let j = 0; j < overlappingLinks.length; j++) {
                        overlappingLinks[j].offset = j-shift;
                    }
                    /**
                     * changes the 0 offset if
                     * - loop links (offset is used as multiplier, avoids multiplication for 0),
                     * - even number of links ("balances" the distribution of the links)
                     */
                    if (overlappingLinks[0].source == overlappingLinks[0].target || overlappingLinks.length % 2 == 0) {
                        overlappingLinks.forEach(l => {
                            if (l.offset == 0) {
                                l.offset = overlappingLinks.length - shift;
                            }
                        })
                    }
                    //changes the sign of the offset if the link is overlapped but the source and target are swapped
                    for (let i = 1; i < overlappingLinks.length; i++) {
                        if (overlappingLinks[i].source != overlappingLinks[0].source) { //swapped => change the offset sign
                            overlappingLinks[i].offset = -overlappingLinks[i].offset;
                        }
                    }
                } else if (link1.source == link1.target) { //no overlapping, but loop link
                    link1.offset = -1; //change the offset in order to avoid multiplication by 0 when computing the control point of the path
                }
            }
        }
        let linkForce: d3.ForceLink<{}, Link> = this.simulation.force('link');
        linkForce.links(this.links);
    }

    public addChildren(node: Node, children: Node[]) {
        //Add childrens to the nodes array
        children.forEach(n => {
            //add children to the nodes array only if it is not already in
            if (this.getNode(n.res) == null) {
                n.x = node.x; //set the same x and y of the parent
                n.y = node.y;
                this.nodes.push(n);
            }
        });
        //add the links with node as source and children as targets
        children.forEach(n => {
            this.links.push(new Link(node, this.getNode(n.res)));
        });
        this.update();
    }

    /**
     * Append the links to the given nodes. If the target of the links doesn't exist yet, it is created.
     * @param sourceNode 
     * @param links 
     */
    public appendLinks(sourceNode: Node, links: Link[]) {
        links.forEach(link => {
            let targetNode = this.getNode(link.target.res);
            //add linkedNodes to the nodes array only if it is not already in
            if (targetNode == null) {
                //set the same x and y of the parent
                link.target.x = sourceNode.x;
                link.target.y = sourceNode.y;
                this.nodes.push(link.target);
            } else {
                link.target = targetNode;
            }
            //add the source node to the openBy list of the target
            link.target.openBy.push(link.source);

            this.links.push(link);
        });
        this.update();
    }

    public closeNode(node: Node) {
        this.deleteSubtree(node);
        this.update();
    }

    /**
     * Returns true if the given node has outgoing, namely if there are links with that node as source
     * @param node 
     */
    public hasOutgoingLink(node: Node): boolean {
        for (let i = 0; i < this.links.length; i++) {
            if (this.links[i].source.res.getNominalValue() == node.res.getNominalValue()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Utils
     */

    /**
     * Returns the Node contained in the nodes array for the given resource. Null if the resource has no related Node
     * @param res 
     */
    private getNode(res: ARTNode) {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].res.getNominalValue() == res.getNominalValue()) {
                return this.nodes[i];
            }
        }
        return null;
    }

    private getLinksFrom(node: Node) {
        let links: Link[] = [];
        this.links.forEach(l => {
            if (l.source.res.getNominalValue() == node.res.getNominalValue()) {
                links.push(l);
            }
        });
        return links;
    }

    private getLinksTo(node: Node) {
        let links: Link[] = [];
        this.links.forEach(l => {
            if (l.target.res.getNominalValue() == node.res.getNominalValue()) {
                links.push(l);
            }
        });
        return links;
    }

    /**
     * Delete the subtree rooted on the given node.
     * @param node 
     */
    private deleteSubtree(node: Node) {
        let recursivelyClosingNodes: Node[] = []; //nodes target in the removed links that needs to be closed in turn
        let linksFromNode: Link[] = this.getLinksFrom(node);
        if (linksFromNode.length > 0) {
            //removes links with the node as source
            linksFromNode.forEach(l => {
                //remove the source node from the openBy list
                l.target.openBy.splice(l.target.openBy.indexOf(l.source), 1);
                //remove the link
                this.links.splice(this.links.indexOf(l), 1);
                //if now the openBy list is empty, it means that the node would be dangling, then...
                if (l.target.openBy.length == 0) {
                    this.nodes.splice(this.nodes.indexOf(l.target), 1); //remove the node
                    recursivelyClosingNodes.push(l.target); //add to the list of nodes to recursively close
                }
            })
            //call recursively the deletion of the subtree for the deleted node)
            recursivelyClosingNodes.forEach(n => {
                this.deleteSubtree(n);
            });
        }
    }


}


export class GraphOptions {
    width: number;
    height: number;
    forces: GraphForces;

    constructor(width: number, height: number, forces?: GraphForces) {
        this.width = width;
        this.height = height;
        if (forces) {
            this.forces = forces
        } else {
            this.forces = new GraphForces();
        }
    }
}

export class GraphForces {
    charge: ForceCharge;
    collide: ForceCollide;
    link: ForceLink;
    constructor() {
        this.charge = {
            strength: -50,
            // distanceMin: 1,
            // distanceMax: 2000
        };
        this.collide = {
            strength: 1,
            radius: Size.Circle.radius
        };
        this.link = {
            strength: 0.2,
            distance: 200
        };
    }
}

export class ForceCharge {
    strength: number;
    distanceMin?: number;
    distanceMax?: number;
}
export class ForceCollide {
    strength: number;
    radius: number;
}
export class ForceLink {
    strength: number;
    distance: number;
}

