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
import { ConverterContractDescription, PearlValidationResult, RDFCapabilityType, RequirementLevels, SignatureDescription } from "../../../models/Coda";
import { ResourceUtils } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ConverterConfigModal } from "./converterConfigModal";
import { ConstraintType, LangConstraintType, WizardField, WizardFieldLiteral, WizardFieldUri, WizardNode, WizardNodeEntryPoint, WizardNodeFromField } from "./CustomFormWizard";

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
    entryPoint: WizardNodeEntryPoint; //entry node of the graph section
    nodesFromField: WizardNodeFromField[]; //nodes automatically generated through fields, these cannot be edited
    userNodes: WizardNode[]; //nodes that user can add arbitrarly

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

        this.entryPoint = new WizardNodeEntryPoint();
        this.nodesFromField = [];
        this.userNodes = [];
        
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
        // creates the node produced from the user prompt fields
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
                    langArgNode.updateConverterSerialization(this.prefixMappings);
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
            node.updateConverterSerialization(this.prefixMappings);
            node.feature = f;
            return node;
        })

        //since now nodesFromField has changed, restore the selection of the object in the nodes relations panel
        for (let g of this.graphs) {
            //if the selected object was a node (not a resource) generated from a field
            if (g.object.type == GraphObjectType.node && g.object.node instanceof WizardNodeFromField) {
                let gObject: WizardNodeFromField = g.object.node;
                //update the object with the wizard node with the same feature
                let newObject: WizardNodeFromField = this.nodesFromField.find(n => n.feature == gObject.feature); //the object 
                g.object.node = newObject;
            }
        }

        this.updatePearl();
    }

    /* ====================
    * NODES
    * ==================== */

    addNode() {
        this.userNodes.push(new WizardNode("new_node"));
        this.updatePearl();
    }

    removeNode(node: WizardNode) {
        this.userNodes.splice(this.userNodes.indexOf(node), 1);
        this.updatePearl();
    }

    editNodeConverter(node: WizardNode) {
        const modalRef: NgbModalRef = this.modalService.open(ConverterConfigModal, new ModalOptions('xl'));
        modalRef.componentInstance.converter = node.converterStatus != null ? node.converterStatus.converter : null;
        modalRef.componentInstance.rangeType = (node == this.entryPoint) ? RangeType.resource : null; //in case of entry point, restrict the converter to those producing URI
        modalRef.result.then(
            (data: ConverterConfigStatus) => {
                node.converterStatus = data;
                node.updateConverterSerialization(this.prefixMappings);
                this.updatePearl();
            },
            () => {}
        );
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

    onGraphObjectValueChange(graph: GraphEntry, value: ARTNode) {
        graph.object.value = value;
        this.updatePearl();
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
        this.userNodes.forEach(n => {
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
        // - TODO duplicates
        
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
        for (let n of this.userNodes) {
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
            if ((g.object.type == GraphObjectType.node && g.object.node == null) || (g.object.type == GraphObjectType.value && g.object.value == null)) {
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




class GraphEntry {
    subject: WizardNode;
    predicate: ARTURIResource;
    // object: WizardNode | ARTNode;
    object: {
        type: GraphObjectType,
        node?: WizardNode,
        value?: ARTNode
    }

    constructor(subject: WizardNode) {
        this.subject = subject;
        this.object = { type: GraphObjectType.node }
    }

    getSerialization(prefixMapping: PrefixMapping[]): GraphEntrySerialization {
        let triples: string[] = [];
        let optional: boolean = this.object instanceof WizardNodeFromField && this.object.feature.optional;

        let subject: string = "$" + this.subject.nodeId;

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

enum GraphObjectType {
    node = "node",
    value ="value"
}

interface GraphEntrySerialization {
    triples: string[];
    optional: boolean;
}