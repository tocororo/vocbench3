import { EventEmitter } from "@angular/core";
import * as d3 from "d3";
import { ARTNode } from "../../models/ARTResources";
import { Size } from "./GraphConstants";
import { Link } from "./Link";
import { Node } from "./Node";
import { options } from "jsprolog/dist/prologSolver";

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
        if (!options || !options.width || !options.height) {
            throw new Error('missing options when initializing simulation');
        }
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

    private update() {
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
            .radius(this.options.forces.collide.strength);

        let linkForce: d3.ForceLink<{}, Link> = this.simulation.force('link');
        linkForce
            .strength(this.options.forces.link.strength)
            .distance(this.options.forces.link.distance);

        this.simulation.restart();
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
            //sort links by source and target
            this.links.sort((a: Link, b: Link) => {
                if (a.source.res.getNominalValue() > b.source.res.getNominalValue()) { return 1; }
                else if (a.source.res.getNominalValue() < b.source.res.getNominalValue()) { return -1; }
                else {
                    if (a.target.res.getNominalValue() > b.target.res.getNominalValue()) { return 1; }
                    if (a.target.res.getNominalValue() < b.target.res.getNominalValue()) { return -1; }
                    else { return 0; }
                }
            });
            //iterate over the links in order to collect equal links
            for (let i = 0; i < this.links.length-1; i++) {
                //if two consicutive links have the same source-target links...
                if (this.links[i].source == this.links[i + 1].source && this.links[i].target == this.links[i + 1].target) {
                    let equalLinks: Link[] = [this.links[i], this.links[i + 1]]; //...init an array (of equal links) with the two links
                    for (var j = i+1; j < this.links.length-1; j++) { //from the index of the 2nd link onwards looks for other euqal links
                        if (this.links[j].source == this.links[j + 1].source && this.links[j].target == this.links[j + 1].target) {
                            equalLinks.push(this.links[j+1]);
                        } else break;
                    }
                    if (equalLinks.length > 0) { //if equal links are found set the offset (balanced around 0, e.g. -2, -1, 0, 1, 2)
                        for (let k = 0; k < equalLinks.length; k++) {
                            (k%2==0) ? equalLinks[k].offset = k+1 : equalLinks[k].offset = -k; //even index => offset positive, odd index => offset negative
                        }
                        if (equalLinks.length % 2 == 1) { //in case of odd number of equal links
                            equalLinks[equalLinks.length-1].offset = 0; //balance the offset of the last link to 0
                        }
                        i = j; //update the index of the outer loop
                    }
                }
            };
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
                this.links.splice(this.links.indexOf(l), 1);
                //add the target to the array of node to close in turn, only if it is not pointed by any other link (multiple parent)
                if (this.getLinksTo(l.target).length == 0) {
                    recursivelyClosingNodes.push(l.target);
                }
            })
            //removes from nodes array the target nodes of the removed links
            recursivelyClosingNodes.forEach(n => {
                this.nodes.splice(this.nodes.indexOf(n), 1);
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

