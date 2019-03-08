import { ARTURIResource } from "./ARTResources";

export class GraphModelRecord {
    source: ARTURIResource;
    link: ARTURIResource;
    target: ARTURIResource;
    classAxiom: boolean;
}

export class GraphClassAxiomFilter {
    property: ARTURIResource;
    show: boolean;
}