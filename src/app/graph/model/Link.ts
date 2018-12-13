import { Node } from "./Node";
import { ARTURIResource } from "../../models/ARTResources";

// Implementing SimulationLinkDatum interface into our custom Link class
export class Link implements d3.SimulationLinkDatum<Node> {
    // Optional - defining optional implementation properties - required for relevant typing assistance
    index?: number;
    
    source: Node;
    target: Node;
    predicate: ARTURIResource;

    offset: number = 0; //useful in case there are multiple links for the same source-target pair
    
    constructor(source: Node, target: Node, predicate?: ARTURIResource) {
        this.source = source;
        this.target = target;
        this.predicate = predicate;
    }
}