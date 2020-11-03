import { ResourceUtils } from "../utils/ResourceUtils";
import { ARTNode, ARTURIResource } from "./ARTResources";
import { RDFCapabilityType } from "./Coda";

export class SimpleHeader {
    public id: string;
    public nameStruct: NameStruct;
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
                if (g.nodeIds.indexOf(node.nodeId) != -1) {
                    used = true;
                }
            }
        });
        return used;
    }
}

export class NameStruct {
    fullName: string;
    name: string;
    lang?: string;
    datatype?: string;
}

export class SubjectHeader {
    public id: string;
    public pearlFeature: string;
    public node: NodeConversion;
    public typeGraph: SimpleGraphApplication;
    public additionalGraphs: SimpleGraphApplication[];
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
    public value?: ARTNode;
}
export class AdvancedGraphApplication extends GraphApplication {
    public nodeIds: string[];
    public pattern: string;
    public prefixMapping: {[prefix: string]: string};
    public defaultPredicate?: ARTURIResource;
}

export class CODAConverter {
    public type: RDFCapabilityType;
    public contractUri: string;
    public datatypeUri: string; //e.g. datatype in "literal^^xsd:string"
    public datatypeCapability: string; //datatype that the converter can produce (e.g. coda:date produces xsd:date)
    public language: string; //e.g. language in "literal@it"
    public params: { [key: string]: any };
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
        let typeGraph: SimpleGraphApplication;
        let typeGraphJson = json.type_graph;
        if (typeGraphJson != null) {
            typeGraph = <SimpleGraphApplication>this.parseGraphApplication(typeGraphJson);
        }
        let additionalGraphs: SimpleGraphApplication[] = [];
        let additionalGraphsJson = json.additional_graphs;
        additionalGraphsJson.forEach((gJson: any) => {
            additionalGraphs.push(this.parseSimpleGraphApplication(gJson))
        });

        let h: SubjectHeader = {
            id: json.id,
            pearlFeature: json.pearlFeature,
            node: node,
            typeGraph: typeGraph,
            additionalGraphs: additionalGraphs
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
            nameStruct: json.nameStruct,
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
            return this.parseSimpleGraphApplication(gJson);
        } else { //advanced graph application
            return this.parseAdvancedGraphApplication(gJson);
        }
    }

    private static parseSimpleGraphApplication(gJson: any): SimpleGraphApplication {
        let g = new SimpleGraphApplication();
        g.id = gJson.id;
        g.nodeId = gJson.nodeId;
        g.property = (gJson.property) ? new ARTURIResource(gJson.property) : null;
        g.value = (gJson.value) ? ResourceUtils.parseNode(gJson.value) : null;
        return g;
    }

    private static parseAdvancedGraphApplication(gJson: any): AdvancedGraphApplication {
        let g = new AdvancedGraphApplication();
        g.id = gJson.id;
        g.nodeIds = gJson.nodeIds;
        g.pattern = gJson.pattern;
        g.prefixMapping = gJson.prefixMapping;
        g.defaultPredicate = (gJson.defaultPredicate) ? new ARTURIResource(gJson.defaultPredicate) : null;
        return g;
    }

}

export enum FsNamingStrategy {
    columnAlphabeticIndex = "columnAlphabeticIndex",
    columnNumericIndex = "columnNumericIndex",
    normalizedHeaderName = "normalizedHeaderName"
}