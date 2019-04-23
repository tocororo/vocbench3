import { Deserializer } from "../utils/Deserializer";
import { ARTURIResource } from "./ARTResources";
import { RDFCapabilityType } from "./Coda";

export class SimpleHeader {
    public id: string;
    public name: string;
    public pearlFeature: string;
    public isMultiple: boolean;
    public ignore: boolean;

    public nodes: NodeConversion[];
    public graph: GraphApplication[];

    /**
     * Returns true if the node is used by a graph application of the given header
     */
    public static isNodeReferenced(header: SimpleHeader, node: NodeConversion): boolean {
        let used: boolean = false;
        header.graph.forEach(g => {
            if (g instanceof SimpleGraphApplication) {
                if (g.nodeId == node.nodeId) {
                    used = true;
                }
            } else if (g instanceof AdvancedGraphApplication) {
                if (g.nodeIds.indexOf(node.nodeId)) {
                    used = true;
                }
            }
        });
        return used;
    }
}

export class SubjectHeader {
    public id: string;
    public pearlFeature: string;
    public node: NodeConversion;
    public graph: SimpleGraphApplication;
}

export class NodeConversion {
    public nodeId: string;
    public converter: CODAConverter;
    public memoize: boolean;
}

export abstract class GraphApplication {
    public id: string;
}
export class SimpleGraphApplication extends GraphApplication {
    public nodeId: string;
    public property: ARTURIResource;
    public type?: ARTURIResource;
}
export class AdvancedGraphApplication extends GraphApplication {
    public nodeIds: string[];
    public pattern: string;
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
        let graph: SimpleGraphApplication;
        let gJson = json.graph;
        if (gJson != null) {
            graph = <SimpleGraphApplication>this.parseGraphApplication(gJson);
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
            ignore: json.ignore,
            nodes: nodes,
            graph: graph
        }
        return h;
    }

    private static parseGraphApplication(gJson: any): GraphApplication {
        if (gJson.hasOwnProperty('nodeId')) { //simple graph application
            let g = new SimpleGraphApplication();
            g.id = gJson.id;
            g.nodeId = gJson.nodeId;
            g.property = (gJson.property) ? Deserializer.createURI(gJson.property) : null;
            g.type = (gJson.type) ? Deserializer.createURI(gJson.type) : null;
            return g;
        } else { //advanced graph application
            let g = new AdvancedGraphApplication();
            g.id = gJson.id;
            g.nodeIds = gJson.nodeIds;
            g.pattern = gJson.pattern;
            return g;
        }
    }

}

export enum FsNamingStrategy {
    columnAlphabeticIndex = "columnAlphabeticIndex",
    columnNumericIndex = "columnNumericIndex",
    normalizedHeaderName = "normalizedHeaderName"
}