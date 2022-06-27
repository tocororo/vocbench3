import { EventEmitter } from "@angular/core";
import * as d3 from "d3";
import { ARTNode, ARTURIResource } from "../../models/ARTResources";
import { Size } from "./GraphConstants";
import { GraphUtils } from "./GraphUtils";
import { Link } from "./Link";
import { Node } from "./Node";

export class ForceDirectedGraph {
    public ticker: EventEmitter<d3.Simulation<Node, Link>> = new EventEmitter(); //at every tick of the simulation, emits an event
    public simulation: d3.Simulation<any, any>;

    public options: GraphOptions;
    public dynamic: boolean = true; //useful to know if the graph should react to double click on nodes (e.g. graph for graph query result is not dynamic)

    private nodes: Node[] = [];
    private links: Link[] = [];

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
            // this.simulation.on('tick', function () {
            //     ticker.emit(this);
            // });
            this.simulation.on('tick', () => {
                ticker.emit();
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
        let chargeForce: d3.ForceManyBody<any> = this.simulation.force('charge'); //repulsion (if strength negative), attraction (if positive) among nodes
        chargeForce
            // .strength(this.options.forces.charge.strength) 
            .strength((node: Node) => this.getCharge(node, this.links))
            .distanceMin(this.options.forces.charge.distanceMin)
            .distanceMax(this.options.forces.charge.distanceMax);

        let collideForce: d3.ForceCollide<any> = this.simulation.force('collide'); //avoid collision between nodes in the given radius
        collideForce
            .strength(this.options.forces.collide.strength)
            .radius(this.options.forces.collide.radius);

        let linkForce: d3.ForceLink<any, Link> = this.simulation.force('link');
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
        return charge * -50;
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
        if (this.links.length > 0 && this.links[0].res != null) {
            //resets all the offsets: useful since once the links are changed, some links could be no more overlapped
            this.links.forEach(l => { l.offset = 0; });

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
                    for (let i = 0, x = group.length - 1; i < group.length; i++, x--) {
                        let offset: number; //-1, 1, -2, 2, -3, 3, ...
                        if (x % 2 == 0) { //even index
                            offset = -x / 2 - 1;
                        } else { //odd index
                            offset = x / 2 + 0.5;
                        }
                        group[i].offset = offset;
                    }
                }
            });
        }
        let linkForce: d3.ForceLink<any, Link> = this.simulation.force('link');
        linkForce.links(this.links);
    }

    /**
     * Returns a list of overlapping links (list of links list). 
     * Overlapping links are those links that connect the same source to the same target or viceversa (A->B or B->A).
     * This methods is useful in order to set an offset to links that connect the same nodes and to avoid that
     * multiple svg path are overlapped (and so indistinguishable)
     */
    private getOverlappingLinkGroups(): Link[][] {
        let linkGroups: Link[][] = [];
        let yetInOverlapping: Link[] = []; //links already considered among the overlapped, useful in order to avoid duplicated links
        for (let i = 0; i < this.links.length; i++) {
            let overlappingGroup: Link[] = [];
            let link1: Link = this.links[i];
            if (link1.source == link1.target) continue; //if loop, ignore it
            if (yetInOverlapping.indexOf(link1) != -1) continue; //link already considered as overlapped, so ignore it
            //starting from the following link, looks for overlapping links
            for (let j = i + 1; j < this.links.length; j++) {
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

    /**
     * Returns a list of looping links (list of links list). 
     * Looping links are those links where source and target are the same node (A->A)
     * This methods is useful in order to set an offset to links that create a loop and to avoid
     * multiple svg path are overlapped (and so indistinguishable)
     */
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
            for (let j = i + 1; j < this.links.length; j++) {
                let link2: Link = this.links[j];
                if (GraphUtils.areLinksOverlapped(link1, link2)) {
                    loopingGroup.push(link2);
                    yetInLooping.push(link2);
                }
            }
            // inizialize loop flag (useful for uml nodes)
            loopingGroup.forEach(l => { l.loop = true; });
            linkGroups.push(loopingGroup);
        }
        return linkGroups;
    }

    /**
     * SETTER GETTER
     */

    public getNodes(): Node[] {
        return this.nodes;
    }

    /**
     * Returns the Node contained in the nodes array for the given resource. Null if the resource has no related Node
     * @param res 
     */
    public getNode(res: ARTNode) {
        if (res.isLiteral()) return null; //literal node should never be reused, return null
        return this.nodes.find(n => n.res.equals(res));
    }

    public addNode(node: Node) {
        this.nodes.push(node);
    }
    public removeNode(node: Node): boolean {
        let idx = this.nodes.indexOf(node);
        if (idx != -1) {
            this.nodes.splice(idx, 1);
            return true;
        }
        return false;
    }

    public getLinks(): Link[] {
        return this.links;
    }

    /**
     * Returns the link representing the given triple
     * @param source 
     * @param property 
     * @param target 
     */
    public getLink(source: ARTNode, property: ARTURIResource, target: ARTNode): Link {
        for (let i = 0; i < this.links.length; i++) {
            let l = this.links[i];
            if (l.source.res.equals(source) && l.target.res.equals(target) && l.res.equals(property)) {
                return l;
            }
        }
        return null;
    }

    public getLinksFrom(node: Node) {
        let links: Link[] = [];
        this.links.forEach(l => {
            if (l.source.res.equals(node.res)) {
                links.push(l);
            }
        });
        return links;
    }

    public getLinksTo(node: Node) {
        let links: Link[] = [];
        this.links.forEach(l => {
            if (l.target.res.equals(node.res)) {
                links.push(l);
            }
        });
        return links;
    }

    public addLink(link: Link) {
        this.links.push(link);
    }
    public removeLink(link: Link): boolean {
        let idx = this.links.indexOf(link);
        if (idx != -1) {
            this.links.splice(idx, 1);
            return true;
        }
        return false;
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
            this.forces = forces;
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
            distanceMax: 800
        };
        this.collide = {
            strength: 1, //strength of rejection between nodes
            radius: Size.Circle.radius + 5 //radius in which avoid collision between node (default: circle radius with a padding)
        };
        this.link = {
            strength: 1, //strength with which the links maintain the given distance
            distance: 250 //distance of the links
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

