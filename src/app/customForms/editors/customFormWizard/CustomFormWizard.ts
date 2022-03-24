import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { ConverterContractDescription, ConverterUtils, RequirementLevels, SignatureDescription } from "src/app/models/Coda";
import { AnnotationName, CustomForm, FormFieldType } from "src/app/models/CustomForms";
import { PrefixMapping } from "src/app/models/Metadata";
import { CODAConverter } from "src/app/models/Sheet2RDF";
import { OntoLex, SKOS, SKOSXL } from "src/app/models/Vocabulary";
import { Deserializer } from "src/app/utils/Deserializer";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalType } from "src/app/widget/modal/Modals";

export abstract class FeatureStructure {
    featureName: string;
}

export class SessionFeature extends FeatureStructure {
    constructor(name: string) {
        super();
        this.featureName = CustomForm.SESSION_PREFIX + name;
    }

    static readonly user: SessionFeature = new SessionFeature("user");
}

export class StandardFormFeature extends FeatureStructure {
    constructor(name: string) {
        super();
        this.featureName = CustomForm.STD_FORM_PREFIX + name;
    }

    static readonly resource: StandardFormFeature = new StandardFormFeature("resource");
    static readonly labelLang: StandardFormFeature = new StandardFormFeature("labelLang");
    static readonly label: StandardFormFeature = new StandardFormFeature("label");
    static readonly xlabel: StandardFormFeature = new StandardFormFeature("xlabel");
    static readonly lexicalForm: StandardFormFeature = new StandardFormFeature("lexicalForm");
    static readonly lexicon: StandardFormFeature = new StandardFormFeature("lexicon");
    // static readonly schemes: StandardFormFeature = new StandardFormFeature("schemes"); //still not used in ST

    static getStdFeatures(model: string, lexModel: string): StandardFormFeature[] {
        let features: StandardFormFeature[] = [StandardFormFeature.resource];
        if (model == OntoLex.uri) {
            features.push(StandardFormFeature.lexicon);
        }
        if (lexModel == SKOS.uri) {
            features.push(StandardFormFeature.labelLang);
            features.push(StandardFormFeature.label);
        } else if (lexModel == SKOSXL.uri) {
            features.push(StandardFormFeature.labelLang);
            features.push(StandardFormFeature.xlabel);
            features.push(StandardFormFeature.lexicalForm);
        }
        features.sort((f1, f2) => f1.featureName.localeCompare(f2.featureName));
        return features;
    }
}

/**
 * FIELDS
 */

export abstract class WizardField extends FeatureStructure {
    abstract type: FormFieldType;
    label: string;
    optional: boolean;

    abstract enumeration: ARTNode[];

    //annotation related
    collection: CollectionConstraint = new CollectionConstraint(); //(annotation @Collection)
    constraint: ConstraintType = null;

    constructor(label: string) {
        super();
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

export abstract class WizardNode {
    nodeId: string;
    converterStatus: ConverterConfigStatus;
    converterSerialization: string = "";
    feature?: FeatureStructure; //feature in input to converter (if required)
    paramNode?: WizardNode; //optional node used as parameter of other nodes (ATM the only usage is with field with language user prompted, so with coda:langString converter)

    entryPoint: boolean;
    fromField: boolean;
    userCreated: boolean;
    advGraph: boolean;

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
                if (this.feature instanceof WizardField) {
                    nodeAnnotations = this.feature.getAnnotationSerializations();
                }
            }
            nodeDef += " " + feature;
        }
        nodeDefSerializations.push(new NodeDefinitionSerialization(nodeDef, nodeAnnotations));
        return nodeDefSerializations;
    }

}

export class WizardNodeEntryPoint extends WizardNode {
    static readonly NodeID: string = "entryPoint";
    constructor() {
        super(WizardNodeEntryPoint.NodeID);
        this.entryPoint = true;
    }
}
export class WizardNodeFromField extends WizardNode {
    fieldSeed: WizardField; //field which generated this node (useful to keep trace of field->node bound in the wizard)
    constructor(field: WizardField) {
        super(field.label);
        this.feature = field;
        this.fieldSeed = field;
        this.fromField = true;
    }
}
export class WizardNodeUserCreated extends WizardNode {
    constructor(nodeId: string) {
        super(nodeId);
        this.userCreated = true;
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

/**
 * GRAPH
 */

export class WizardGraphEntry {
    subject: WizardNode;
    predicate: ARTURIResource;
    object: WizardGraphEntryObject;

    constructor(subject: WizardNode) {
        this.subject = subject;
        this.object = { type: GraphObjectType.node }
    }

    getSerialization(prefixMapping: PrefixMapping[]): GraphEntrySerialization {
        let triples: string[] = [];
        //optional if the subject of object are nodes generated from optional field
        let optional: boolean = this.subject instanceof WizardNodeFromField && this.subject.fieldSeed.optional ||
            this.object.type == GraphObjectType.node && this.object.node instanceof WizardNodeFromField && this.object.node.fieldSeed.optional;

        let subject: string = "%SUBJECT%";
        if (this.subject != null) {
            subject = "$" + this.subject.nodeId;
        }

        let predicate: string = "%PREDICATE%";
        if (this.predicate != null) {
            predicate = ResourceUtils.getQName(this.predicate.getURI(), prefixMapping);
            if (predicate == this.predicate.getURI()) {
                predicate = "<" + predicate + ">"; //failed to get QName, so sorround the URI with <>
            }
        }

        let object: string = "%OBJECT%";
        if (this.object != null) {
            if (this.object.type == GraphObjectType.node) {
                if (this.object.node != null) {
                    object = "$" + this.object.node.nodeId;
                }
            } else { //value
                if (this.object.value != null) {
                    if (this.object.value instanceof ARTURIResource) {
                        object = ResourceUtils.getQName(this.object.value.getURI(), prefixMapping);
                        if (object == this.object.value.getURI()) {
                            object = "<" + object + ">"; //failed to get QName, so sorround the URI with <>
                        }
                    } else {
                        object = this.object.value.toNT();
                    }
                }
            }
        }

        triples.push(subject + " " + predicate + " " + object);

        let ges: GraphEntrySerialization = {
            triples: triples,
            optional: optional
        }
        return ges;
    }
}

export class WizardAdvGraphEntry {
    fieldSeed: WizardField; //not provided in case of imported/exported AdvGraph (in that case implicitly means/replaced-by the editing field)
    nodes: WizardNodeUserCreated[]; //nodes created internally the AdvGraph
    referencedNodes: WizardNode[]; //already existing nodes created outside the AdvGraph
    prefixMapping: {[prefix: string]: string};
    pattern: string;
}

interface WizardGraphEntryObject {
    type: GraphObjectType;
    node?: WizardNode;
    value?: ARTNode;
}

export enum GraphObjectType {
    node = "node",
    value = "value"
}

export interface GraphEntrySerialization {
    triples: string[];
    optional: boolean;
}


export interface WizardStatus {
    customRange: boolean;
    fields: WizardField[];
    nodes: WizardNode[];
    graphs: WizardGraphEntry[];
    advGraphs: WizardAdvGraphEntry[];
}


export class WizardStatusUtils {

    static restoreWizardStatus(jsonStatus: any): WizardStatus {
        let fields: WizardField[] = jsonStatus.fields.map((fJson: any) => this.restoreWizardField(fJson));
        let nodes: WizardNode[] = jsonStatus.nodes.map((nJson: any) => this.restoreWizardNode(nJson, fields));
        let graphs: WizardGraphEntry[] = jsonStatus.graphs.map(gJson => this.restoreWizardGraphEntry(gJson, nodes));
        let advGraphs: WizardAdvGraphEntry[] = jsonStatus.advGraphs ? jsonStatus.advGraphs.map(gJson => this.restoreWizardAdvGraphEntry(gJson, nodes, fields)) : [];
        let status: WizardStatus = {
            customRange: jsonStatus.customRange,
            fields: fields,
            nodes: nodes,
            graphs: graphs,
            advGraphs: advGraphs
        }
        return status;
    }

    //========== FIELDS ==============

    static restoreWizardField(jsonStatus): WizardField {
        if (jsonStatus.type == "literal") {
            return WizardStatusUtils.restoreWizardFieldLiteral(jsonStatus)
        } else { //jsonStatus.type == "uri"
            return WizardStatusUtils.restoreWizardFieldUri(jsonStatus)
        }
    }

    static restoreWizardFieldLiteral(jsonStatus: any): WizardFieldLiteral {
        let field: WizardFieldLiteral = new WizardFieldLiteral(jsonStatus.label);
        field.collection = jsonStatus.collection;
        field.constraint = jsonStatus.constraint;
        field.datatype = jsonStatus.datatype != null ? Deserializer.createURI(jsonStatus.datatype) : null,
            field.enumeration = Deserializer.createLiteralArray(jsonStatus.enumeration);
        field.featureName = jsonStatus.featureName;
        field.label = jsonStatus.label;
        field.languageConstraint = jsonStatus.languageConstraint;
        field.optional = jsonStatus.optional;
        return field;
    }

    static restoreWizardFieldUri(jsonStatus: any): WizardFieldUri {
        let field: WizardFieldUri = new WizardFieldUri(jsonStatus.label);
        field.collection = jsonStatus.collection;
        field.constraint = jsonStatus.constraint;
        field.enumeration = Deserializer.createURIArray(jsonStatus.enumeration);
        field.featureName = jsonStatus.featureName;
        field.label = jsonStatus.label;
        field.optional = jsonStatus.optional;
        field.ranges = Deserializer.createURIArray(jsonStatus.ranges);
        field.roles = jsonStatus.roles;
        return field;
    }

    //========== NODES ==============

    static restoreWizardNode(jsonStatus: any, fields: WizardField[]): WizardNode {
        if (jsonStatus.entryPoint) {
            return WizardStatusUtils.restoreWizardNodeEntryPoint(jsonStatus, fields);
        } else if (jsonStatus.fromField) {
            return WizardStatusUtils.restoreWizardNodeFromField(jsonStatus, fields);
        } else { //jsonStatus.userCreated
            return WizardStatusUtils.restoreWizardNodeUserCreated(jsonStatus, fields);
        }
    }

    static restoreWizardNodeEntryPoint(jsonStatus: any, fields: WizardField[]): WizardNodeEntryPoint {
        let n: WizardNodeEntryPoint = new WizardNodeEntryPoint();
        n.paramNode = (jsonStatus.paramNode != null) ? this.restoreWizardNode(jsonStatus.paramNode, fields) : null;
        n.converterStatus = (jsonStatus.converterStatus != null) ? this.restoreConverterConfigStatus(jsonStatus.converterStatus) : null;
        if (n.converterStatus != null) {
            n.updateConverterSerialization();
        }
        if (jsonStatus.feature != null) { //node may use a random converter which doesn't need feature
            n.feature = this.restoreReferencedFeature(jsonStatus.feature, fields);
        }
        return n;
    }

    static restoreWizardNodeFromField(jsonStatus: any, fields: WizardField[]): WizardNodeFromField {
        let fieldSeed: WizardField = fields.find(f => f.label == jsonStatus.fieldSeed.label);
        if (fieldSeed == null) { //in case of field used only as param (e.g. for coda:langString converter), referenced field seed is not included among the fields of the status
            fieldSeed = this.restoreWizardField(jsonStatus.fieldSeed);
        }
        let n: WizardNodeFromField = new WizardNodeFromField(fieldSeed);
        n.paramNode = (jsonStatus.paramNode != null) ? this.restoreWizardNode(jsonStatus.paramNode, fields) : null;
        n.converterStatus = (jsonStatus.converterStatus != null) ? this.restoreConverterConfigStatus(jsonStatus.converterStatus) : null;
        if (n.converterStatus != null) {
            n.updateConverterSerialization();
        }
        return n;
    }

    static restoreWizardNodeUserCreated(jsonStatus: any, fields: WizardField[]): WizardNodeUserCreated {
        let n: WizardNodeUserCreated = new WizardNodeUserCreated(jsonStatus.nodeId);
        n.paramNode = (jsonStatus.paramNode != null) ? this.restoreWizardNode(jsonStatus.paramNode, fields) : null;
        n.converterStatus = (jsonStatus.converterStatus != null) ? this.restoreConverterConfigStatus(jsonStatus.converterStatus) : null;
        if (n.converterStatus != null) {
            n.updateConverterSerialization();
        }
        if (jsonStatus.feature != null) { //node may use a random converter which doesn't need feature
            n.feature = this.restoreReferencedFeature(jsonStatus.feature, fields);
        }
        return n;
    }

    static restoreConverterConfigStatus(jsonStatus: any): ConverterConfigStatus {
        let conv: CODAConverter = new CODAConverter(jsonStatus.converter.type, jsonStatus.converter.contractUri);
        conv.datatypeCapability = jsonStatus.converter.datatypeCapability;
        conv.datatypeUri = jsonStatus.converter.datatypeUri;
        conv.language = jsonStatus.converter.language;
        conv.params = jsonStatus.converter.params;
        let c: ConverterConfigStatus = {
            converter: conv,
            converterDesc: ConverterContractDescription.parse(jsonStatus.converterDesc),
            signatureDesc: SignatureDescription.parse(jsonStatus.signatureDesc)
        }
        return c;
    }

    private static restoreReferencedFeature(featureJson: FeatureStructure, fields: WizardField[]): FeatureStructure {
        let feature: FeatureStructure = fields.find(f => f.featureName == featureJson.featureName);
        if (feature != null) {
            return feature;
        } else { //feature null => it was not a feature related to a field; probably a feature builtin
            if (SessionFeature.user.featureName == featureJson.featureName) {
                return SessionFeature.user;
            } else if (StandardFormFeature.label.featureName == featureJson.featureName) {
                return StandardFormFeature.label;
            } else if (StandardFormFeature.labelLang.featureName == featureJson.featureName) {
                return StandardFormFeature.labelLang;
            } else if (StandardFormFeature.lexicalForm.featureName == featureJson.featureName) {
                return StandardFormFeature.lexicalForm;
            } else if (StandardFormFeature.resource.featureName == featureJson.featureName) {
                return StandardFormFeature.resource;
            } else if (StandardFormFeature.xlabel.featureName == featureJson.featureName) {
                return StandardFormFeature.xlabel;
            }
        }
        return null;
    }

    //========== GRAPH ==============

    static restoreWizardGraphEntry(jsonStatus: any, nodes: WizardNode[]): WizardGraphEntry {
        let s: WizardNode = nodes.find(n => n.nodeId == jsonStatus.subject.nodeId);
        let g: WizardGraphEntry = new WizardGraphEntry(s);
        g.predicate = new ARTURIResource(jsonStatus.predicate.uri);

        let objType: GraphObjectType = jsonStatus.object.type;
        let graphObj: WizardGraphEntryObject = {
            type: objType
        }
        if (objType == GraphObjectType.node) {
            let oNode: WizardNode;
            if (jsonStatus.object.node != null) { //node might be not assigned
                oNode = nodes.find(n => n.nodeId == jsonStatus.object.node.nodeId);
            }
            graphObj.node = oNode;
        } else { //value
            let oValue: ARTNode;
            if (jsonStatus.object.value != null) { //value might be not assigned
                oValue = Deserializer.createRDFNode(jsonStatus.object.value);
            }
            graphObj.value = oValue
        }
        g.object = graphObj;
        return g;
    }

    static restoreWizardAdvGraphEntry(jsonStatus: any, nodes: WizardNode[], fields: WizardField[]): WizardAdvGraphEntry {
        let advG: WizardAdvGraphEntry = new WizardAdvGraphEntry();
        advG.fieldSeed = fields.find(f => f.label == jsonStatus.fieldSeed.label);
        advG.referencedNodes = jsonStatus.referencedNodes.map((nJson: any) => nodes.find(n => n.nodeId == nJson.nodeId));
        advG.nodes = jsonStatus.nodes.map((nJson: any) => WizardStatusUtils.restoreWizardNode(nJson, fields));
        advG.pattern = jsonStatus.pattern;
        advG.prefixMapping = jsonStatus.prefixMapping;
        return advG;
    }

}

export class CustomFormWizardUtils {

    static checkNode(node: WizardNode, basicModals: BasicModalServices): boolean {
        //check on ID
        if (node.nodeId == null || node.nodeId.trim() == "") {
            basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NODE_MISSING_ID" }, ModalType.warning);
            return false;
        } else if (node.converterStatus != null) {
            if (node.converterStatus.signatureDesc.getRequirementLevels() == RequirementLevels.REQUIRED && node.feature == null) {
                basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NODE_MISSING_CONVERTER_FEATURE", params: { id: node.nodeId } }, ModalType.warning);
                return false;
            }
        } else {
            basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NODE_MISSING_CONVERTER", params: { id: node.nodeId } }, ModalType.warning);
            return false;
        }
        return true;
    }

}