export class CustomService {
    name: string;
    description?: string;
    operations?: CustomOperation[]
}

export class CustomOperation {
    name: string;
    parameters?: OperationParameter[];
    returns?: OperationType;
    authorization?: string;
}

export class OperationParameter {
    name: string;
    required: boolean;
    type: OperationType;
}

export class OperationType {
    name: string;
    typeArguments?: OperationType[];
}

export class SPARQLOperation extends CustomOperation {
    sparql: string;
}

export enum CustomOperationType {
    default = "default",
    sparqlOperation = "sparqlOperation",
}

export class Types {
    public static boolean: OperationType = { name: "boolean" }
    public static void: OperationType = { name: "void" }
    public static IRI: OperationType = { name: "IRI" }
    public static Literal: OperationType = { name: "Literal" }
    public static Resource: OperationType = { name: "Resource" }
    public static String: OperationType = { name: "java.lang.String" }
}