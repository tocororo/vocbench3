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
    public dynamic: boolean = true;

    public nodes: Node[] = [];
    public links: Link[] = [];

    constructor(nodes: Node[], links: Link[], dynamic: boolean) {
        this.nodes = nodes;
        this.links = links;
        this.dynamic = dynamic;
    }

    public initSimulation(options: GraphOptions) {
        this.options = options;

        //Creating the simulation
        if (!this.simulation) {
            const ticker = this.ticker;

            // Creating the force simulation and defining the charges
            this.simulation = d3.forceSimulation();
            //init forces
            this.simulation.force("center", d3.forceCenter(this.options.width / 2, this.options.height / 2));
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
            // .strength(this.options.forces.charge.strength) 
            .strength((node: Node) => this.getCharge(node, this.links)) 
            .distanceMin(this.options.forces.charge.distanceMin)
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
    private getCharge(node: Node, links: Link[]): number {
        let charge = 0;
        links.forEach(l => {
            if (l.source == node) charge++;
            if (l.target == node) charge++;
        });
        return charge*-50;
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

            //set offset for overlapping links (offsets are balanced around the 0, e.g. if 5 links => -2,-1,0,1,2)
            let overlappingLinkGroups = this.getOverlappingLinkGroups();
            overlappingLinkGroups.forEach(group => {
                let shift = Math.floor(group.length / 2);
                for (let i = 0; i < group.length; i++) {
                    let offset = i - shift;
                    if (offset == 0 && group.length % 2 == 0) { //changes the 0 offset in case the overlapping links are even
                        offset = group.length - shift;
                    }
                    if (group[i].source != group[0].source) {
                        offset = -offset; //links overlapped, but with source and target swapped have inverted sign
                    }
                    group[i].offset = offset;
                }
            });

            //set offsets for loops
            let loopingLinkGroups = this.getLoopingLinkGroups();
            loopingLinkGroups.forEach(group => {
                if (group.length == 1) {
                    group[0].offset = -1; //offset -1 in order to avoid multiplication by 0 when computing the control point of the loop
                } else {
                    let shift = Math.floor(group.length / 2);
                    for (let i = 0; i < group.length; i++) { //links overlapped, but with source and target swapped have inverted sign
                        let offset = i - shift;
                        if (offset == 0) {
                            offset = group.length - shift;
                        }
                        group[i].offset = offset;
                    }
                }
            });
        }
        let linkForce: d3.ForceLink<{}, Link> = this.simulation.force('link');
        linkForce.links(this.links);
    }

    private getOverlappingLinkGroups(): Link[][] {
        let linkGroups: Link[][] = [];
        let yetInOverlapping: Link[] = []; //links already considered among the overlapped, useful in order to avoid duplicated links
        for (let i = 0; i < this.links.length; i++) {
            let overlappingGroup: Link[] = [];
            let link1: Link = this.links[i];
            if (link1.source == link1.target) continue; //if loop, ignore it
            if (yetInOverlapping.indexOf(link1) != -1) continue; //link already considered as overlapped, so ignore it
            //starting from the following link, looks for overlapping links
            for (let j = i+1; j < this.links.length; j++) {
                let link2: Link = this.links[j];
                if (GraphUtils.areLinksOverlapped(link1, link2)) {
                    overlappingGroup.push(link2);
                    yetInOverlapping.push(link2);
                }
            }
            if (overlappingGroup.length > 0) {
                overlappingGroup.push(link1);
                yetInOverlapping.push(link1);
                linkGroups.push(overlappingGroup);
            }
        }
        return linkGroups;
    }

    private getLoopingLinkGroups(): Link[][] {
        let linkGroups: Link[][] = [];
        let yetInLooping: Link[] = []; //links already considered among the looping, useful in order to avoid duplicated links
        for (let i = 0; i < this.links.length; i++) {
            let loopingGroup: Link[] = [];
            let link1: Link = this.links[i];
            if (link1.source != link1.target) continue; //if not a loop, ignore it
            if (yetInLooping.indexOf(link1) != -1) continue; //link already considered as looping, so ignore it

            loopingGroup.push(link1);
            yetInLooping.push(link1);
            //starting from the following link, looks for overlapping links
            for (let j = i+1; j < this.links.length; j++) {
                let link2: Link = this.links[j];
                if (GraphUtils.areLinksOverlapped(link1, link2)) {
                    loopingGroup.push(link2);
                    yetInLooping.push(link2);
                }
            }
            linkGroups.push(loopingGroup);
        }
        return linkGroups;
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
            strength: -100, //strength of attraction (if positive) or repulsion (if negative)
            distanceMin: 50, //min distance between nodes
            // distanceMax: 2000
        };
        this.collide = {
            strength: 1, //strength of rejection between nodes
            radius: Size.Circle.radius + 5 //radius in which avoid collision between node (default: circle radius with a padding)
        };
        this.link = {
            strength: 1, //strength with which the links maintain the given distance
            distance: 250 //distance of the links
            // strength: 0.3, //strength with which the links maintain the given distance
            // distance: 200 //distance of the links
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

