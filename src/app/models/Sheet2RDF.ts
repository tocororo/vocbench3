import { ARTURIResource, RDFTypesEnum } from "./ARTResources";
import { Deserializer } from "../utils/Deserializer";
import { RDFCapabilityType, XRole } from "./Coda";

export class SimpleHeader {
    public id: string;
    public name: string;
    public pearlFeature: string;
    public isMultiple: boolean;

    public nodes: NodeConversion[];
    public graph: GraphApplication[];
}

export class SubjectHeader {
    public id: string;
    public pearlFeature: string;
    public node: NodeConversion;
    public graph: GraphApplication;
}

export class NodeConversion {
    public nodeId: string;
    public converter: CODAConverter;
    public memoize: boolean;
}
export class GraphApplication {
    public id: string;
    public nodeId: string;
    public property: ARTURIResource;
    public type?: ARTURIResource;
}

export class CODAConverter {
    public capability: RDFCapabilityType;
    public contract: string;
    public datatype: string;
    public language: string;
    public params: { [key: string]: string };
}

export class TableContent {
    public returned: number;
    public total: number;
    public rows: TableRow[];
}

export class TableCell {
    public idx: number;
    public value: string;
}

export class TableRow {
    public idx: number;
    public cells: TableCell[];
}

/**
 * A triple of the generated triples preview
 */
export class TriplePreview {
    public row: number;
    public subject: string;
    public predicate: string;
    public object: string;
}

export class Sheet2RdfDeserializer {

    public static parseSubjectHeader(json: any): SubjectHeader {
        let node: NodeConversion = json.node;
        let graph: GraphApplication;
        let gJson = json.graph;
        if (gJson != null) {
            graph = this.parseGraphApplication(gJson);
        }

        let h: SubjectHeader = {
            id: json.id,
            pearlFeature: json.pearlFeature,
            node: node,
            graph: graph
        }
        return h;
    }

    public static parseSimpleHeader(json: any): SimpleHeader {
        let nodes: NodeConversion[] = json.nodes;
        let graph: GraphApplication[] = [];
        json.graph.forEach((gJson: any) => {
            graph.push(this.parseGraphApplication(gJson))
        });

        let h: SimpleHeader = {
            id: json.id,
            name: json.name,
            pearlFeature: json.pearlFeature,
            isMultiple: json.isMultiple,
            nodes: nodes,
            graph: graph
        }
        return h;
    }

    private static parseGraphApplication(gJson: any): GraphApplication {
        return {
            id: gJson.id,
            nodeId: gJson.nodeId,
            property: (gJson.property) ? Deserializer.createURI(gJson.property) : null,
            type: (gJson.type) ? Deserializer.createURI(gJson.type) : null
        }
    }

}