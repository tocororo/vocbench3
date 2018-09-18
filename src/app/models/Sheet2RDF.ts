import { ARTURIResource, RDFTypesEnum, RDFResourceRolesEnum } from "./ARTResources";
import { RDFCapabilityType, XRole } from "./Coda";

export class HeaderStruct {
    public id: string;
    public name: string;
    public isMultiple: boolean;
    public resource: ARTURIResource;
    public range: {
        type: RDFTypesEnum;
        resource?: ARTURIResource; //range class (in case type is resource) or datatype (type literal)
        lang?: string;
    }
    public converter: {
        uri: string;
        type: RDFCapabilityType;
        xRole: XRole;
        memoize: boolean;
    };
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