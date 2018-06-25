import { ARTURIResource, RDFTypesEnum, RDFResourceRolesEnum } from "./ARTResources";
import { RDFCapabilityType } from "./Coda";

export class HeaderStruct {
    public id: string;
    public name: string;
    public isMultiple: boolean;
    public resource: ARTURIResource;
    public lang: string;
    public range: {
        type: RDFTypesEnum;
        cls: ARTURIResource;
    }
    public converter: {
        uri: string;
        type: RDFCapabilityType;
    };
    public memoize: boolean;
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