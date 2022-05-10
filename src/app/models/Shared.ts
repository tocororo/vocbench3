import { Deserializer } from "../utils/Deserializer";
import { ARTNode, ARTResource, ARTURIResource, TripleScopes } from "./ARTResources";

export class Pair<S, T> {
    first: S;
    second: T;
}

/**
 * Map which value is a list of given type T
 */
export interface Multimap<T> {
    [key: string]: T[]
}

export class Triple {
    subject: ARTResource;
    predicate: ARTURIResource;
    object: ARTNode;
    graphs: ARTURIResource[];
    tripleScope: TripleScopes;

    static parse(tJson: any): Triple {
        let splittedGraph: string[] = tJson.graphs.split(",");
        let graphs: ARTURIResource[] = splittedGraph.map(g => new ARTURIResource(g.trim()));
        return {
            subject: Deserializer.createRDFResource(tJson.subject),
            predicate: Deserializer.createURI(tJson.predicate),
            object: Deserializer.createRDFNode(tJson.object),
            graphs: graphs,
            tripleScope: tJson.tripleScope
        };
    }
}