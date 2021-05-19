import { NTriplesUtil } from "../utils/ResourceUtils";
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
    public graph: SimpleGraphApplication;
    public additionalGraphs: SimpleGraphApplication[];
}

export class NodeConversion {
    public nodeId: string;
    public converter: CODAConverter;
    public memoize: boolean;
    public memoizeId?: string;
}

export abstract class GraphApplication {
    public id: string;
    public delete: boolean;
}
export class SimpleGraphApplication extends GraphApplication {
    public nodeId: string;
    public property: ARTURIResource;
    public type?: ARTURIResource;
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

    constructor(type: RDFCapabilityType, uri: string) {
        this.type = type;
        this.contractUri = uri;
    }

    /**
     * Tells if all the parameters foreseen by the signature have been provided
     * @returns 
     */
    static isSignatureOk(converter: CODAConverter): boolean {
        let isSignatureOk: boolean = true;
        for (let key in converter.params) {
            let paramValue = converter.params[key];
            if (paramValue != null) { //param not null, check if it is ok according its type
                if (typeof paramValue === "string" && paramValue.trim() == "") { //string must not be empty
                    isSignatureOk = false;
                } else if (Array.isArray(paramValue)) { //array must not be empty or populated with empty value
                    if (paramValue.length == 0) {
                        isSignatureOk = false;
                    } else {
                        paramValue.forEach(v => {
                            if (v == null) {
                                isSignatureOk = false;
                            }
                        });
                    }
                } else if (typeof paramValue == "object") { //map must not have empty value
                    if (JSON.stringify(paramValue) == "{}") { //empty object
                        isSignatureOk = false;
                    } else {
                        for (let key in <any>paramValue) {
                            if (key == null || paramValue[key] == null) {
                                isSignatureOk = false;
                            }
                        }
                    }
                }
            } else { //param null
                isSignatureOk = false;
            }
        }
        return isSignatureOk;
    }
}

export class MemoizeData {
    enabled: boolean = false;
    id: string = null;
}

export class MemoizeContext {
    //list of ID for the memoization (this is stored only client side for the entire work session of s2rdf and it is retrieved from the header list)
    static idList: string[] = [];
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
    public delete: boolean;
    public subject: string;
    public predicate: string;
    public object: string;
}

export class Sheet2RdfDeserializer {

    public static parseSubjectHeader(json: any): SubjectHeader {
        let node: NodeConversion = json.node;
        let typeGraph: SimpleGraphApplication;
        let typeGraphJson = json.graph;
        if (typeGraphJson != null) {
            typeGraph = <SimpleGraphApplication>this.parseGraphApplication(typeGraphJson);
        }
        let additionalGraphs: SimpleGraphApplication[] = [];
        let additionalGraphsJson = json.additionalGraphs;
        additionalGraphsJson.forEach((gJson: any) => {
            additionalGraphs.push(this.parseSimpleGraphApplication(gJson))
        });

        let h: SubjectHeader = {
            id: json.id,
            pearlFeature: json.pearlFeature,
            node: node,
            graph: typeGraph,
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
        g.delete = gJson.delete;
        g.nodeId = gJson.nodeId;
        g.property = (gJson.property) ? new ARTURIResource(gJson.property) : null;
        g.type = (gJson.type) ? NTriplesUtil.parseURI(gJson.type) : null;
        g.value = (gJson.value) ? NTriplesUtil.parseNode(gJson.value) : null;
        return g;
    }

    private static parseAdvancedGraphApplication(gJson: any): AdvancedGraphApplication {
        let g = new AdvancedGraphApplication();
        g.id = gJson.id;
        g.delete = gJson.delete;
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

export class Sheet2RdfSettings {
    useHeaders: boolean = true;
    namingStrategy: FsNamingStrategy = FsNamingStrategy.columnNumericIndex;
}