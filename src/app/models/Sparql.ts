import { RDFResourceRolesEnum } from "./ARTResources";

export class VariableBindings {
    [varName: string]: { 
        bindingType : BindingTypeEnum,
        datatype?: string,
        resourceRole?: RDFResourceRolesEnum,
        value?: string //NT representation 
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