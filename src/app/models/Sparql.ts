import { RDFResourceRolesEnum } from "./ARTResources";

export class VariableBindings {
    [varName: string]: { 
        bindingType : BindingTypeEnum,
        datatype?: string,
        resourceRole?: RDFResourceRolesEnum,
        value?: string //NT representation 
        description?: string,
        displayName?: string,
    }
}

export enum BindingTypeEnum {
    constraint = "constraint",
    assignment = "assignment"
}

export enum ResultType {
    graph = "graph",
    tuple = "tuple",
    boolean = "boolean"
}

export enum QueryMode {
    query = "query",
    update = "update"
}

export class GraphResultBindings {
    subj: GraphBinding;
    pred: GraphBinding;
    obj: GraphBinding;
}

export class GraphBinding {
    type: "uri" | "literal" | "bnode";
    value: string;
    datatype?: string;
    'xml:lang': string;
}