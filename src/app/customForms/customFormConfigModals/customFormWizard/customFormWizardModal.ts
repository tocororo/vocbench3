import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ARTNode, ARTURIResource } from "src/app/models/ARTResources";
import { PrefixMapping } from "src/app/models/Metadata";
import { CODAConverter } from "src/app/models/Sheet2RDF";
import { CODAServices } from "src/app/services/codaServices";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { RangeType } from "src/app/services/propertyServices";
import { VBContext } from "src/app/utils/VBContext";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { ModalOptions, ModalType } from "src/app/widget/modal/Modals";
import { ConverterContractDescription, ConverterUtils, PearlValidationResult, RDFCapabilityType, RequirementLevels, SignatureDescription } from "../../../models/Coda";
import { ResourceUtils } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ConverterConfigModal } from "./converterConfigModal";
import { ConstraintType, LangConstraintType, WizardField, WizardFieldLiteral, WizardFieldUri } from "./CustomFormWizard";

@Component({
    selector: "custom-form-wizard-modal",
    templateUrl: "./customFormWizardModal.html",
})
export class CustomFormWizardModal {

    /*
    TODO:
    - dare la possibilità di creare triple più complesse nella parte graph
    - dare la possibilità di selezionare valori (IRI/Literal) come object in una relation
    - distinguere creazione di CustomForm e CustomConstructor (entry point non necessario)
    - considerare anche le feature structure alternative a userPrompt/
        - stdForm (solo per constructor):
            - resource
            - labelLang //in SKOS e SKOSXL
            - label //in SKOS
            - xlabel, lexicalForm //in SKOSXL
        - session
            - user
    */

    @Input() formId: string = "FORM_ID";

    customRange: boolean = true; //tells if the wizard creates a CustomRange or a CustomConstructor

    prefixMappings: PrefixMapping[];

    //fields
    fields: WizardField[];

    //nodes
    entryPoint: WizardNode; //entry node of the graph section
    nodesFromField: WizardNodeFromField[]; //nodes automatically generated through fields, these cannot be edited
    nodes: WizardNode[]; //nodes that user can add arbitrarly


    private converters: ConverterContractDescription[];

    //graph
    graphs: GraphEntry[];
    selectedGraph: GraphEntry;

    pearl: string;

    constructor(private activeModal: NgbActiveModal, private modalService: NgbModal, private elementRef: ElementRef,
        private cfService: CustomFormsServices, private codaService: CODAServices,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) {
    }

    ngOnInit() {
        this.prefixMappings = VBContext.getWorkingProjectCtx().getPrefixMappings();
        this.fields = [];
        this.nodesFromField = [];
        this.nodes = [];
        this.entryPoint = new WizardNode("entryPointNode");
        this.graphs = [];

        this.codaService.listConverterContracts().subscribe(
            converters => {
                this.converters = converters;
            }
        );
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    /* ====================
    * FIELDS
    * ==================== */

    onFieldChange() {
        //creates the node produced from the user prompt fields
        this.nodesFromField = this.fields.map(f => {
            let node: WizardNodeFromField = new WizardNodeFromField(f);

            let convDesc: ConverterContractDescription;
            let convSign: SignatureDescription;
            let codaConv: CODAConverter;
            if (f instanceof WizardFieldLiteral) {
                let convCandidates: ConverterContractDescription[] = this.converters.filter(c => c.isCapabilityCompliant(RDFCapabilityType.literal));
                convDesc = convCandidates.find(c => c.getURI().endsWith("default")); //TODO refine selection
                convSign = convDesc.getSignatures()[0];
                codaConv = new CODAConverter(RDFCapabilityType.literal, convDesc.getURI());

                //in case of language prompted by user...
                if (f.languageConstraint.type == LangConstraintType.UserPrompted) {
                    //select the langString converter
                    convDesc = convCandidates.find(c => c.getURI().endsWith("langString"));
                    convSign = convDesc.getSignatures()[0];
                    codaConv = new CODAConverter(RDFCapabilityType.literal, convDesc.getURI());
                    //create a new field for the language, then from it create a node to set as parameter for the current one
                    let langArgField: WizardFieldLiteral = new WizardFieldLiteral(f.label + "_lang");
                    let langArgNode: WizardNode = new WizardNodeFromField(langArgField);
                    //for the langArg node use simply the default converter
                    let langArgConvDesc: ConverterContractDescription = convCandidates.find(c => c.getURI().endsWith("default"));
                    let langArgConvSign: SignatureDescription = langArgConvDesc.getSignatures()[0];
                    let langArgCodaConv: CODAConverter = new CODAConverter(RDFCapabilityType.literal, langArgConvDesc.getURI());
                    langArgNode.converterStatus = {
                        converter: langArgCodaConv,
                        converterDesc: langArgConvDesc,
                        signatureDesc: langArgConvSign,
                    }
                    this.updateConverterSerialization(langArgNode);
                    //then add it as param to the current node
                    node.paramNode = langArgNode;
                    //finally set the lang arg node as parameter of the langString converter
                    codaConv.params = {
                        langArg: "$" + langArgNode.nodeId
                    }
                }
                //set other facets of the literal converter
                codaConv.language = (f.constraint == ConstraintType.LangString && f.languageConstraint.type == LangConstraintType.Fixed) ? f.languageConstraint.language : null;
                codaConv.datatypeUri = (f.constraint == ConstraintType.Datatype && f.datatype != null) ? f.datatype.getURI() : null;
                // codaConv.datatypeCapability = (f.constraint == ConstraintType.Datatype && f.datatype != null) ? f.datatype.getURI() : null;
            } else if (f instanceof WizardFieldUri) {
                let convCandidates: ConverterContractDescription[] = this.converters.filter(c => c.isCapabilityCompliant(RDFCapabilityType.uri))
                convDesc = convCandidates.find(c => c.getURI().endsWith("default")); //TODO refine selection
                convSign = convDesc.getSignatures()[0];
                codaConv = new CODAConverter(RDFCapabilityType.uri, convDesc.getURI());
            }
            let convStatus: ConverterConfigStatus = {
                converter: codaConv,
                converterDesc: convDesc,
                signatureDesc: convSign
            }
            node.converterStatus = convStatus;
            this.updateConverterSerialization(node);
            node.feature = f;
            return node;
        })

        //since now nodesFromField has changed, restore the selection of the object in the nodes relations panel
        for (let g of this.graphs) {
            if (g.object instanceof WizardNodeFromField) { //if the selected object was a node (not a resource) generated from a field
                let gObject: WizardNodeFromField = g.object;
                //update the object with the wizard node with the same feature
                let newObject: WizardNodeFromField = this.nodesFromField.find(n => n.feature == gObject.feature); //the object 
                g.object = newObject;
            }
        }

        this.updatePearl();
    }

    /* ====================
    * NODES
    * ==================== */

    addNode() {
        this.nodes.push(new WizardNode("new_node"));
        this.updatePearl();
    }

    removeNode(node: WizardNode) {
        this.nodes.splice(this.nodes.indexOf(node), 1);
        this.updatePearl();
    }

    editNodeConverter(node: WizardNode) {
        const modalRef: NgbModalRef = this.modalService.open(ConverterConfigModal, new ModalOptions('xl'));
        modalRef.componentInstance.converter = node.converterStatus != null ? node.converterStatus.converter : null;
        modalRef.componentInstance.rangeType = (node == this.entryPoint) ? RangeType.resource : null; //in case of entry point, restrict the converter to those producing URI
        modalRef.result.then(
            (data: ConverterConfigStatus) => {
                node.converterStatus = data;
                this.updateConverterSerialization(node);
                this.updatePearl();
            },
            () => {}
        );
    }

    private updateConverterSerialization(node: WizardNode) {
        node.converterSerialization = ConverterUtils.getConverterProjectionOperator(node.converterStatus.converterDesc, node.converterStatus.signatureDesc, 
            node.converterStatus.converter.type, node.converterStatus.converter.params, node.converterStatus.converter.language, node.converterStatus.converter.datatypeUri,
            this.prefixMappings);
    }

    
    /* ====================
    * GRAPH
    * ==================== */

    addGraph() {
        let g: GraphEntry = new GraphEntry(this.entryPoint);
        this.graphs.push(g);
        this.updatePearl();
    }

    removeGraph() {
        this.graphs.splice(this.graphs.indexOf(this.selectedGraph), 1);
        this.selectedGraph = null;
        this.updatePearl();
    }

    selectPredicate(graph: GraphEntry) {
        this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}).then(
            (property: ARTURIResource) => {
                graph.predicate = property;
                this.updatePearl();
            },
            () => {}
        )
    }


    //==========================

    updatePearl() {
        let indentCount: number = 0;
        this.pearl = "rule it.uniroma2.art.semanticturkey.customform.form." + this.formId + " id:" + this.formId + " {\n";

        //NODES
        indentCount++;
        this.pearl += this.getIndent(indentCount) + "nodes = {\n"; //open nodes
        indentCount++;
        //- entry point
        this.entryPoint.getNodeSerializations(this.prefixMappings).forEach(ns => {
            if (ns.annotations != null) {
                ns.annotations.forEach(a => {
                    this.pearl += this.getIndent(indentCount) + a + "\n";
                })
            }
            this.pearl += this.getIndent(indentCount) + ns.nodeDefinition + " .\n";
        })
        //- nodes from fields
        this.nodesFromField.forEach(n => {
            n.getNodeSerializations(this.prefixMappings).forEach(ns => {
                if (ns.annotations != null) {
                    ns.annotations.forEach(a => {
                        this.pearl += this.getIndent(indentCount) + a + "\n";
                    })
                }
                this.pearl += this.getIndent(indentCount) + ns.nodeDefinition + " .\n";
            })
        })
        //- other nodes
        this.nodes.forEach(n => {
            n.getNodeSerializations(this.prefixMappings).forEach(ns => {
                if (ns.annotations != null) {
                    ns.annotations.forEach(a => {
                        this.pearl += this.getIndent(indentCount) + a + "\n";
                    })
                }
                this.pearl += this.getIndent(indentCount) + ns.nodeDefinition + " .\n";
            })
        })

        indentCount--;
        this.pearl += this.getIndent(indentCount) + "}\n"; //close nodes

        //GRAPH
        this.pearl += this.getIndent(indentCount) + "graph = {\n" //open graph
        indentCount++;

        this.graphs.forEach(g => {
            let s: GraphEntrySerialization = g.getSerialization(this.prefixMappings);
            if (s.optional) {
                this.pearl += this.getIndent(indentCount) + "OPTIONAL {\n"; //open optional
                indentCount++
            }
            s.triples.forEach(t => {
                this.pearl += this.getIndent(indentCount) + t + " .\n";
            })
            if (s.optional) {
                indentCount--;
                this.pearl += this.getIndent(indentCount) + "}\n"; //close optional
            }
        })
        indentCount--;
        this.pearl += this.getIndent(indentCount) + "}\n"; //close graph
        this.pearl += "}"; //close rule

        //PREFIX
        //collected at the end in order to declare only those used
        let prefixDeclaration = "";
        this.prefixMappings.forEach(m => {
            if (this.pearl.includes(m.prefix + ":")) {
                prefixDeclaration += "prefix\t" + m.prefix + ":\t<" + m.namespace + ">\n";
            }
        })
        //coda prefix is always declared (if not already in prefixMapping of the project)
        if (!this.prefixMappings.some(m => m.namespace == ConverterContractDescription.NAMESPACE)) { 
            prefixDeclaration += "prefix\tcoda:\t<" + ConverterContractDescription.NAMESPACE + ">\n";
        }

        this.pearl = prefixDeclaration + "\n" + this.pearl;
    }

    private getIndent(count: number) {
        let indent: string = "";
        for (let i = 0; i < count; i++) {
            indent += "\t";
        }
        return indent;
    }

    private checkData(): boolean {
        //check fields
        if (this.fields.length == 0) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "No field has been provided", ModalType.warning);
            return false;
        }
        for (let i = 0; i < this.fields.length; i++) {
            let field = this.fields[i];
            //check on names
            if (field.label.trim() == "") { //invalid name
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field at position " + (i + 1) + " has an invalid name", ModalType.warning);
                return false;
            }
            //look for duplicate
            if (this.fields.filter(f => f.label == field.label).length > 1) { //found more than 1 field with the name of the current one
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Found multiple fields with the same name (" + field.label + ")", ModalType.warning);
                return false;
            }
            //check if all constraints are ok
            if (field.constraint == ConstraintType.Datatype && (<WizardFieldLiteral>field).datatype == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Datatype, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.Enumeration && field.enumeration.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Enumeration, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.LangString) {
                if ((<WizardFieldLiteral>field).languageConstraint.type == LangConstraintType.Fixed && (<WizardFieldLiteral>field).languageConstraint.language == null) {
                    this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.LangString, ModalType.warning);
                    return false;
                }
            }
            if (field.constraint == ConstraintType.Range && (<WizardFieldUri>field).ranges.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Range, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.Role && (<WizardFieldUri>field).roles.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Role, ModalType.warning);
                return false;
            }
        }

        //check nodes
        // - entry point (MEMO: this check only if CF is for CustomRange)
        if (!this.checkNode(this.entryPoint)) {
            return false;
        }
        // - nodes from fields
        for (let n of this.nodesFromField) {
            if (!this.checkNode(n)) {
                return false;
            }
        }
        // - other nodes
        for (let n of this.nodes) {
            if (!this.checkNode(n)) {
                return false;
            }
        }

        //check on graph
        if (this.graphs.length == 0) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "No relation between nodes has been provided", ModalType.warning);
            return false;
        }
        for (let i = 0; i < this.graphs.length; i++) {
            let g: GraphEntry = this.graphs[i];
            if (i == 0 && g.object instanceof WizardNodeFromField && g.object.feature.optional) { //first usage of graph entry point node cannot be optional
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "The first usage of the " + g.subject.nodeId + " in the graph section cannot use an optional field", ModalType.warning);
                return false;
            }
            if (g.predicate == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Missing predicate in node relation at position " + (i+1), ModalType.warning);
                return false;
            }
            if (g.object == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Missing object in node relation at position " + (i+1), ModalType.warning);
                return false;
            }
        }

        //every check passed, data is ok
        return true;

    }

    private checkNode(node: WizardNode): boolean {
        //check on ID
        if (node.nodeId == null || node.nodeId.trim() == "") {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "A node with empty ID has been detected", ModalType.warning);
            return false;
        } else if (node.converterStatus != null) {
            if (node.converterStatus.signatureDesc.getRequirementLevels() == RequirementLevels.REQUIRED && node.feature == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Converter of node '" + node.nodeId + "' requires a feature to be specified", ModalType.warning);
                return false;
            }
        } else {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Converter missing for node '" + node.nodeId + "'", ModalType.warning);
            return false;
        }
        return true;
    }



    ok() {
        if (this.checkData()) {
            this.cfService.validatePearl(this.pearl, "graph").subscribe(
                (result: PearlValidationResult) => {
                    if (result.details) {
                        this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, result.details, ModalType.warning);
                    }
                    return result.valid;
                }
            );
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

class WizardNode {
    nodeId: string;
    converterStatus: ConverterConfigStatus;
    converterSerialization: string = "";
    feature?: WizardField; //feature in input to converter (if required). In case of WizardNodeFromField feature is always provided and by construction it is the one who generated the node
    paramNode?: WizardNode; //optional node used as parameter of other nodes (ATM the only usage is with field with language user prompted, so with coda:langString converter)

    constructor(nodeId: string) {
        this.nodeId = nodeId;
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

class WizardNodeFromField extends WizardNode {
    constructor(field: WizardField) {
        super(field.label + "_node");
        this.feature = field;
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


class GraphEntry {
    subject: WizardNode;
    predicate: ARTURIResource;
    object: WizardNode | ARTNode;

    constructor(subject: WizardNode) {
        this.subject = subject;
    }

    getSerialization(prefixMapping: PrefixMapping[]): GraphEntrySerialization {
        let triples: string[] = [];
        let optional: boolean = this.object instanceof WizardNodeFromField && this.object.feature.optional;

        let subject: string = "$" + this.subject.nodeId;

        let predicate: string;
        if (this.predicate != null) {
            predicate = ResourceUtils.getQName(this.predicate.getURI(), prefixMapping);
            if (predicate == this.predicate.getURI()) {
                predicate = "<" + predicate + ">"; //failed to get QName, so sorround the URI with <>
            }
        } else {
            predicate = "%PREDICATE%";
        }

        let object: string;
        if (this.object != null) {
            if (this.object instanceof WizardNode) {
                object = "$" + this.object.nodeId;
            } else if (this.object instanceof ARTNode) {
                if (this.object instanceof ARTURIResource) {
                    object = ResourceUtils.getQName(this.predicate.getURI(), prefixMapping);
                    if (object == this.object.getURI()) {
                        object = "<" + object + ">"; //failed to get QName, so sorround the URI with <>
                    }
                } else {
                    object = this.object.toNT();
                }
            }
        } else {
            object = "%OBJECT%";
        }

        triples.push(subject + " " + predicate + " " + object);

        let ges: GraphEntrySerialization = {
            triples: triples,
            optional: optional
        }
        return ges;
    }
}

interface GraphEntrySerialization {
    triples: string[];
    optional: boolean;
}