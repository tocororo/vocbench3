import { Configuration } from "./Configuration";

export class CustomServiceDefinition {
    name: string;
    description?: string;
    operations?: CustomOperationDefinition[];
    id?: string; //not in the configuration definition, but useful to keep trace of the id
}

export class CustomService extends Configuration {
    id?: string; //not in the configuration object, but useful to keep trace of the id
}

export class Operation extends Configuration { }

export class CustomOperation extends Configuration { }

export class CustomOperationDefinition {
    '@type': string;
    name: string;
    parameters?: OperationParameter[];
    returns: OperationType;
    authorization?: string;
    serviceId?: string; //not in the operation definition, but usefult to keep trace of the belonging service
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

export class SPARQLOperation extends CustomOperationDefinition {
    sparql: string;
}

export class CustomOperationTypes {
    public static SparqlOperation: string = "it.uniroma2.art.semanticturkey.extension.impl.customservice.sparql.SPARQLOperation";
}

export class TypeUtils {

    /**
     * Contains the definition of the available types
     */
    static Types = class {
        public static AnnotatedValue: string = "AnnotatedValue";
        public static boolean: string = "boolean";
        public static double: string = "double";
        public static float: string = "float";
        public static integer: string = "integer";
        public static IRI: string = "IRI";
        public static List: string = "List";
        public static Literal: string = "Literal";
        public static long: string = "long";
        public static Map: string = "Map";
        public static RDFValue: string = "RDFValue";
        public static Resource: string = "Resource";
        public static short: string = "short";
        public static String: string = "java.lang.String";
        public static TupleQueryResult: string = "TupleQueryResult";
        public static void: string = "void";
    };

    static getRdf4jTypes(): string[] {
        return [TypeUtils.Types.IRI, TypeUtils.Types.Literal, TypeUtils.Types.Resource, TypeUtils.Types.RDFValue];
    }

    /**
     * List of all the known types (the same defined in Types). Useful to get them as list when necessary
     */
    static getAllTypes(): string[] {
        let types = [
            TypeUtils.Types.AnnotatedValue,
            TypeUtils.Types.boolean,
            TypeUtils.Types.double,
            TypeUtils.Types.float,
            TypeUtils.Types.integer,
            TypeUtils.Types.List,
            TypeUtils.Types.long,
            TypeUtils.Types.Map,
            TypeUtils.Types.short,
            TypeUtils.Types.String,
            TypeUtils.Types.TupleQueryResult,
            TypeUtils.Types.void,
        ];
        types = types.concat(TypeUtils.getRdf4jTypes());
        this.sortTypes(types);
        return types;
    }

    /**
     * Types which require arguments
     */
    static getGenericTypes(): string[] {
        return [
            TypeUtils.Types.AnnotatedValue,
            TypeUtils.Types.List,
            TypeUtils.Types.Map
        ];
    }

    /**
     * Maps the generic types with the admitted args
     */
    static getGenericTypeArgs(type: string): string[] {
        if (type == TypeUtils.Types.AnnotatedValue) {
            return ["T"];
        } else if (type == TypeUtils.Types.List) {
            return ["E"];
        } else if (type == TypeUtils.Types.Map) {
            return ["K", "V"];
        }
    }

    /**
     * Maps each generic type with the admitted arg types
     */
    static getAllowedGenericArgsMap(type: string): string[] {
        let args: string[];
        if (type == TypeUtils.Types.AnnotatedValue) {
            args = TypeUtils.getRdf4jTypes();
        } else if (type == TypeUtils.Types.List || type == TypeUtils.Types.Map) {
            args = [
                TypeUtils.Types.AnnotatedValue,
                TypeUtils.Types.boolean,
                TypeUtils.Types.double,
                TypeUtils.Types.float,
                TypeUtils.Types.integer,
                TypeUtils.Types.List,
                TypeUtils.Types.long,
                TypeUtils.Types.Map,
                TypeUtils.Types.short,
                TypeUtils.Types.String
            ].concat(TypeUtils.getRdf4jTypes());
        }
        this.sortTypes(args);
        return args;
    }

    static serializeParameter(opParam: OperationParameter): string {
        let paramPrettyPrint: string = TypeUtils.serializeType(opParam.type);
        paramPrettyPrint += " " + opParam.name;
        return paramPrettyPrint;
    }

    static serializeType(type: OperationType): string {
        let typePrettyPrint: string;
        typePrettyPrint = type.name;
        if (typePrettyPrint.indexOf(".") > 0) { //prevent cases like: "java.lang.String"
            typePrettyPrint = typePrettyPrint.substr(typePrettyPrint.lastIndexOf(".") + 1);
        }
        if (TypeUtils.getGenericTypes().indexOf(type.name) != -1) {
            if (type.typeArguments != null) {
                let argsPrettyPrints = type.typeArguments.map(arg => {
                    if (arg == null) {
                        return "?";
                    } else {
                        return this.serializeType(arg);
                    }
                });
                typePrettyPrint += "<" + argsPrettyPrints.join(",") + ">";
            }
        }
        return typePrettyPrint;
    }

    private static sortTypes(types: string[]) {
        types.sort((t1, t2) => t1.toLocaleLowerCase().localeCompare(t2.toLocaleLowerCase()));
    }


    public static isOperationTypeValid(type: OperationType): boolean {
        if (type == null) return false;
        if (TypeUtils.getGenericTypes().indexOf(type.name) != -1) { //is generic => check if its args are valid
            if (type.typeArguments != null) {
                for (let arg of type.typeArguments) {
                    if (!TypeUtils.isOperationTypeValid(arg)) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

}
