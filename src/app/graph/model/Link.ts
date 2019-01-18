import { Node } from "./Node";
import { ARTURIResource } from "../../models/ARTResources";

export class Link implements d3.SimulationLinkDatum<Node> {
    index?: number;
    
    source: Node;
    target: Node;
    res: ARTURIResource;

    offset: number = 0; //useful in case there are multiple links for the same source-target pair
    
    constructor(source: Node, target: Node, res?: ARTURIResource) {
        this.source = source;
        this.target = target;
        this.res = res;
    }
}