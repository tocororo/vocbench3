import { Deserializer } from "../utils/Deserializer";
import { ARTNode, ARTResource, ARTURIResource, TripleScopes } from "./ARTResources";

export class Pair<S,T> {
    first: S;
    second: T;
}

/**
 * Map which value is a list of given type T
 */
export interface Multimap<T> {
    [key:string]: T[]
}

export class TupleTriple {
    s: ARTResource;
    p: ARTURIResource;
    o: ARTNode;

    static parse(tJson: any): TupleTriple {
        return {
            s: Deserializer.createRDFResource(tJson[0]),
            p: Deserializer.createURI(tJson[1]),
            o: Deserializer.createRDFNode(tJson[2])
        }
    }
}

export class Triple {
    subject: ARTResource;
    predicate: ARTURIResource;
    object: ARTNode;
    graphs: string;
    tripleScope: TripleScopes;

    static parse(tJson: any): Triple {
        return {
            subject: Deserializer.createRDFResource(tJson.subject),
            predicate: Deserializer.createURI(tJson.predicate),
            object: Deserializer.createRDFNode(tJson.object),
            graphs: tJson.graphs,
            tripleScope: tJson.tripleScope
        }
    }
}