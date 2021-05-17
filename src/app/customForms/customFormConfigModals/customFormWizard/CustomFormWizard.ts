import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { AnnotationName, CustomForm, FormFieldType } from "src/app/models/CustomForms";

export abstract class WizardField {
    abstract type: FormFieldType;
    label: string;
    nodeId: string;
    optional: boolean;

    abstract enumeration: ARTNode[] = [];

    //annotation related
    collection: CollectionConstraint = new CollectionConstraint(); //(annotation @Collection)
    constraint: ConstraintType = null;

    constructor(label: string) {
        this.label = label;
        this.nodeId = label + "_node";
    }

    abstract getPlaceholderDefinitions(): PlaceholderDef[];

    protected getAnnotationSerializations(): string[] {
        //the only annotation in commons between uri and literal field is @Collection
        let annotations: string[] = [];
        if (this.collection.enabled) {
            let annotation = "@" + AnnotationName.Collection;
            let min: number = this.collection.minEnabled ? this.collection.min : null;
            let max: number = this.collection.maxEnabled ? this.collection.max : null;
            let annParams: string[] = [];
            if (min != null) {
                annParams.push("min=" + min);
            }
            if (max != null) {
                annParams.push("max=" + max);
            }
            if (annParams.length != 0) {
                annotation += "(" + annParams.join(",") + ")";
            }
            annotations.push(annotation);
        }
        return annotations;
    }
}

export class WizardFieldLiteral extends WizardField {
    type: FormFieldType = FormFieldType.literal;
    languageConstraint: LangConstraint = new LangConstraint();
    datatype: ARTURIResource; //ConstraintType.Datatype
    enumeration: ARTLiteral[] = []; //ConstraintType.Enumeration => list of Literal (annotation @DataOneOf)

    getPlaceholderDefinitions(): PlaceholderDef[] {
        let placeholderDefs: PlaceholderDef[] = [];
        //1st: nodeID
        let nodeId: string = this.nodeId;
        //2nd: converter
        let converter: string = this.type;
        if (this.constraint == ConstraintType.Datatype) {
            let dt: string = this.datatype != null ? this.datatype.getShow() : "%DATATYPE%";
            converter += "^^" + this.datatype.toNT();
        } else if (this.constraint == ConstraintType.LangString) {
            if (this.languageConstraint.type == LangConstraintType.Fixed) {
                let langTag: string = (this.languageConstraint.language != null) ? this.languageConstraint.language : "%LANG%";
                converter += "@" + langTag;
            } else { //UserPrompted
                //define and add a node definition for the language placeholder
                let langPhNodeId = this.label + "_lang_node";
                let langPhDef: PlaceholderDef = new PlaceholderDef(langPhNodeId + " " + FormFieldType.literal + " " + CustomForm.USER_PROMPT_PREFIX + this.label + "_lang");
                placeholderDefs.unshift(langPhDef);
                //then use it in the langString converter
                converter += "(coda:langString($" + langPhNodeId + "))";
            }
        }
        //3rd: feature
        let feature: string = CustomForm.USER_PROMPT_PREFIX + this.label;

        let phDef = new PlaceholderDef(nodeId + " " + converter + " " + feature, this.getAnnotationSerializations());
        placeholderDefs.push(phDef);
        return placeholderDefs;
    }

    protected getAnnotationSerializations(): string[] {
        let annotations: string[] = super.getAnnotationSerializations();
        //in addition to @Collection, Literal nodes accept also @DataOneOf that can be used in combo with @Collection
        let annotation: string;
        if (this.constraint == ConstraintType.Enumeration) {
            annotation = "@" + AnnotationName.DataOneOf;
            annotation += "(value={" + this.enumeration.map(e => e.toNT()).join(",") + "})";
        }
        if (annotation != null) {
            annotations.push(annotation);
        }
        return annotations;
    }
}
export class WizardFieldUri extends WizardField {
    type: FormFieldType = FormFieldType.uri;
    roles: RDFResourceRolesEnum[] = []; //ConstraintType.Role => role of the value admitted by the field (annotation @Role)
    ranges: ARTURIResource[] = []; //ConstraintType.Range => class(es) of the value admitted by the field (annotation @Range or @RangeList)
    enumeration: ARTURIResource[] = []; //ConstraintType.Enumeration => list of Resource (annotation @ObjectOneOf)

    getPlaceholderDefinitions(): PlaceholderDef[] {
        let placeholderDefs: PlaceholderDef[] = [];
        //1st: nodeID
        let nodeId: string = this.nodeId;
        //2nd: converter
        let converter: string = this.type;
        //TODO: eventually add the customization of the converter
        //3rd: feature
        let feature: string = CustomForm.USER_PROMPT_PREFIX + this.label;

        let phDef = new PlaceholderDef(nodeId + " " + converter + " " + feature, this.getAnnotationSerializations());
        placeholderDefs.push(phDef);
        return placeholderDefs;
    }

    getAnnotationSerializations(): string[] {
        let annotations: string[] = super.getAnnotationSerializations();
        /* 
        in addition to @Collection, URI nodes accept also @ObjectOneOf, @Range, @RangeList and @Role.
        even there is no constraint that prevent to use them together, logically (except for @Collection)
        they are mutually exclusive
        */
        let annotation: string;
        if (this.constraint == ConstraintType.Enumeration) {
            annotation = "@" + AnnotationName.ObjectOneOf;
            annotation += "(value={" + this.enumeration.map(e => e.toNT()).join(",") + "})";
        } else if (this.constraint == ConstraintType.Range) {
            if (this.ranges.length == 1) {
                annotation = "@" + AnnotationName.Range;
                annotation += "(value=" + this.ranges[0].toNT() + ")";
            } else if (this.ranges.length > 1) {
                annotation = "@" + AnnotationName.RangeList;
                annotation += "(value={" + this.ranges.map(r => r.toNT()).join(",") + "})";
            }
        } else if (this.constraint == ConstraintType.Role) {
            annotation = "@" + AnnotationName.Role;
            annotation += "(value={" + this.roles.map(r => "'" + r + "'").join(",") + "})";
        }
        if (annotation != null) {
            annotations.push(annotation);
        }
        return annotations;
    }
}

export enum ConstraintType {
    Enumeration = "Enumeration", //@ObjectOneOf (uri) or @DataOneOf (literal)
    Role = "Role", //@Role
    Range = "Range", //@Range or @RangeList
    Datatype = "Datatype", //no annotation, just add datatype to literal converter
    LangString = "LangString", //no annotation, just add language to literal converter
}

export class LangConstraint {
    type: LangConstraintType = LangConstraintType.Fixed;
    language: string;
}
export enum LangConstraintType {
    Fixed = "Fixed",
    UserPrompted = "UserPrompted",
}

export class CollectionConstraint {
    enabled: boolean;
    minEnabled: boolean;
    min: number = 0;
    maxEnabled: boolean;
    max: number = 0;
}

export class PlaceholderDef {
    annotations?: string[];
    nodeDefinition: string;

    constructor(nodeDef: string, annotations?: string[]) {
        this.nodeDefinition = nodeDef;
        this.annotations = annotations;
    }
}