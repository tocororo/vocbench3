import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { ConverterUtils, RequirementLevels } from "src/app/models/Coda";
import { AnnotationName, CustomForm, FormFieldType } from "src/app/models/CustomForms";
import { PrefixMapping } from "src/app/models/Metadata";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";

/**
 * FIELDS
 */

export abstract class WizardField {
    abstract type: FormFieldType;
    label: string;
    featureName: string;
    optional: boolean;

    abstract enumeration: ARTNode[] = [];

    //annotation related
    collection: CollectionConstraint = new CollectionConstraint(); //(annotation @Collection)
    constraint: ConstraintType = null;

    constructor(label: string) {
        this.label = label;
        this.featureName = CustomForm.USER_PROMPT_PREFIX + label;
    }

    getAnnotationSerializations(): string[] {
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

    getAnnotationSerializations(): string[] {
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

/**
 * NODES
 */

export class WizardNode {
    nodeId: string;
    converterStatus: ConverterConfigStatus;
    converterSerialization: string = "";
    feature?: WizardField; //feature in input to converter (if required)
    paramNode?: WizardNode; //optional node used as parameter of other nodes (ATM the only usage is with field with language user prompted, so with coda:langString converter)

    constructor(nodeId: string) {
        this.nodeId = nodeId;
    }

    updateConverterSerialization(prefixMappings?: PrefixMapping[]) {
        this.converterSerialization = ConverterUtils.getConverterProjectionOperator(this.converterStatus.converterDesc, this.converterStatus.signatureDesc, 
            this.converterStatus.converter.type, this.converterStatus.converter.params, this.converterStatus.converter.language, this.converterStatus.converter.datatypeUri,
            prefixMappings);
    }

    getNodeSerializations(prefixMapping: PrefixMapping[]): NodeDefinitionSerialization[] {
        let nodeDefSerializations: NodeDefinitionSerialization[] = [];
        let nodeDef: string = "";
        let nodeAnnotations: string[]; //depend on the characteristics of the wizard field used as feature

        //check if a param node is present, in case add its serialization first (a node can be used as param only if defined before its usage)
        if (this.paramNode != null) {
            let paramNodeSerializations = this.paramNode.getNodeSerializations(prefixMapping);
            nodeDefSerializations.push(...paramNodeSerializations);
        }

        //1st: nodeID
        nodeDef += this.nodeId;
        //2nd: converter
        let converter: string = "%CONVERTER%";
        if (this.converterStatus != null) {
            converter = this.converterSerialization;
        }
        nodeDef += " " + converter;
        //3rd: feature
        let feature: string = "%FEATURE%";
        if (this.converterStatus != null && this.converterStatus.signatureDesc.getRequirementLevels() == RequirementLevels.REQUIRED) {
            if (this.feature != null) {
                feature = this.feature.featureName;
                nodeAnnotations = this.feature.getAnnotationSerializations();
            }
            nodeDef += " " + feature;
        }
        nodeDefSerializations.push(new NodeDefinitionSerialization(nodeDef, nodeAnnotations));
        return nodeDefSerializations;
    }
}

export class WizardNodeEntryPoint extends WizardNode {
    constructor() {
        super("entryPoint_node");
    }
}

export class WizardNodeFromField extends WizardNode {
    fieldSeed: WizardField; //field which generated this node (useful to keep trace of field->node bound in the wizard)
    constructor(field: WizardField) {
        super(field.label + "_node");
        this.feature = field;
        this.fieldSeed = field;
    }
}

class NodeDefinitionSerialization {
    nodeDefinition: string;
    annotations?: string[];
    constructor(nodeDef: string, annotations?: string[]) {
        this.nodeDefinition = nodeDef;
        this.annotations = annotations;
    }
}