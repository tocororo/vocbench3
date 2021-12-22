import { ARTResource, ARTURIResource } from "./ARTResources";

export enum DataGraphContext {
    sparql = "sparql",
    explore = "explore"
}

export class GraphModelRecord {
    source: ARTResource;
    link: ARTURIResource;
    target: ARTResource;
    classAxiom: boolean;
}

export class GraphClassAxiomFilter {
    property: ARTURIResource;
    show: boolean;
}