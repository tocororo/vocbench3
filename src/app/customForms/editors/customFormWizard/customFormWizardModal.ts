import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PrefixMapping } from "src/app/models/Metadata";
import { CODAConverter } from "src/app/models/Sheet2RDF";
import { CODAServices } from "src/app/services/codaServices";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { VBContext } from "src/app/utils/VBContext";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { ModalOptions, ModalType } from "src/app/widget/modal/Modals";
import { ConverterContractDescription, PearlValidationResult, RDFCapabilityType, SignatureDescription } from "../../../models/Coda";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AdvancedGraphEditor } from "./advancedGraphEditor";
import { ConstraintType, CustomFormWizardUtils, GraphEntrySerialization, GraphObjectType, LangConstraintType, WizardAdvGraphEntry, WizardField, WizardFieldLiteral, WizardFieldUri, WizardGraphEntry, WizardNode, WizardNodeEntryPoint, WizardNodeFromField, WizardStatus, WizardStatusUtils } from "./CustomFormWizard";
import { WizardFieldChangeEvent, WizardFieldEventType } from "./customFormWizardFieldsEditor";

@Component({
    selector: "custom-form-wizard-modal",
    templateUrl: "./customFormWizardModal.html",
})
export class CustomFormWizardModal {

    @Input() formId: string = "FORM_ID";
    @Input() customRange: boolean = true; //tells if the wizard creates a CustomRange or a CustomConstructor

    private prefixMappings: PrefixMapping[];
    private converters: ConverterContractDescription[];

    //fields
    fields: WizardField[];
    //nodes
    nodes: WizardNode[];
    //graph
    graphs: WizardGraphEntry[];
    // graphPattern: string = "";
    advGraphs: WizardAdvGraphEntry[];
    selectedAdvGraph: WizardAdvGraphEntry;

    pearl: string;

    constructor(private activeModal: NgbActiveModal, private elementRef: ElementRef, private cfService: CustomFormsServices, private codaService: CODAServices,
        private basicModals: BasicModalServices, private modalService: NgbModal) {
    }

    ngOnInit() {
        this.prefixMappings = VBContext.getWorkingProjectCtx().getPrefixMappings();

        this.fields = [];

        this.nodes = [];
        this.graphs = [];
        this.advGraphs = [];

        if (this.customRange) {
            let entryPoint: WizardNodeEntryPoint = new WizardNodeEntryPoint();
            this.nodes.push(entryPoint);
            let g: WizardGraphEntry = new WizardGraphEntry(entryPoint);
            this.graphs.push(g);
        }

        this.updatePearl();

        this.codaService.listConverterContracts().subscribe(
            converters => {
                this.converters = converters;
            }
        );
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }


    /**
     * When fields change it needs to update also the list of nodes generated from them
     * @param fieldChangeEvent 
     */
    onFieldChange(fieldChangeEvent: WizardFieldChangeEvent) {
        let f: WizardField = fieldChangeEvent.field;
        if (fieldChangeEvent.eventType == WizardFieldEventType.created) {
            //create the related wizard node
            let node: WizardNodeFromField = this.createNodeFromField(f);
            this.nodes.push(node);
        } else if (fieldChangeEvent.eventType == WizardFieldEventType.changed) {
            let node: WizardNodeFromField = this.createNodeFromField(f);
            //in the nodes list replace the node of the changed field
            this.nodes.forEach((n, index) => {
                if (n instanceof WizardNodeFromField && n.fieldSeed == f) {
                    this.nodes[index] = node;
                }
            })
            //update the referenced subject/object node in the graph list
            this.graphs.forEach(g => {
                if (g.subject instanceof WizardNodeFromField && g.subject.fieldSeed == f) {
                    g.subject = node;
                }
                if (g.object.type == GraphObjectType.node && g.object.node instanceof WizardNodeFromField && g.object.node.fieldSeed == f) {
                    g.object.node = node;
                }
            })
        } else if (fieldChangeEvent.eventType == WizardFieldEventType.removed) {
            //remove all the reference of the removed node in both nodes, graphs list and advancedGraph
            let idx = this.nodes.findIndex(n => n instanceof WizardNodeFromField && n.fieldSeed == f);
            this.nodes.splice(idx, 1);
            //remove the referenced subject/object node in the graph list
            this.graphs.forEach(g => {
                if (g.subject instanceof WizardNodeFromField && g.subject.fieldSeed == f) {
                    g.subject = null;
                }
                //if the selected object was a node (not a resource) generated from a field
                if (g.object.type == GraphObjectType.node && g.object.node instanceof WizardNodeFromField && g.object.node.fieldSeed == f) {
                    g.object.node = null;
                }
            })
            //remove the adv-graph that uses the node seeded by the removed field
            this.advGraphs.forEach((g, idx, list) => {
                if (g.nodes.some(n => n instanceof WizardNodeFromField && n.fieldSeed == f)) {
                    list.splice(idx, 1);
                }
            })
        }

        this.updatePearl();
    }

    private createNodeFromField(f: WizardField): WizardNodeFromField {
        let node: WizardNodeFromField = new WizardNodeFromField(f);

        let convDesc: ConverterContractDescription;
        let convSign: SignatureDescription;
        let codaConv: CODAConverter;
        if (f instanceof WizardFieldLiteral) {
            let convCandidates: ConverterContractDescription[] = this.converters.filter(c => c.isCapabilityCompliant(RDFCapabilityType.literal));
            convDesc = convCandidates.find(c => c.getURI().endsWith("default"));
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
        } else if (f instanceof WizardFieldUri) {
            let convCandidates: ConverterContractDescription[] = this.converters.filter(c => c.isCapabilityCompliant(RDFCapabilityType.uri))
            convDesc = convCandidates.find(c => c.getURI().endsWith("default"));
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
    }

    /*
     * ADV GRAPH
     */

    /**
     * delete the adv graph that uses the deleted node.
     * Note: the warning that asks user if he's ok to delete the adgGraph is already handled in the node editor
     */
    onNodeDeleted(node: WizardNode) {
        this.advGraphs.forEach((g, idx, list) => {
            if (g.nodes.some(n => n == node)) {
                list.splice(idx, 1);
            }
        })
    }

    selectAdvGraph(advGraph: WizardAdvGraphEntry) {
        if (this.selectedAdvGraph == advGraph) {
            this.selectedAdvGraph = null;
        } else {
            this.selectedAdvGraph = advGraph;
        }
    }


    addAdvGraph() {
        this.openAdgGraphEditor().then(
            (advGraph: WizardAdvGraphEntry) => {
                this.advGraphs.push(advGraph);
                /*
                TODO: maybe its better to not store adv graph nodes with the other, but these nodes must be kept only in the adv graph.
                Just remember:
                - check when creating node if a node with the same ID is among those in the adv graph (provide advGraphs as Input to the node editor)
                - when serializing pearl, write also nodes of the adv graphs (since they are not stored anymore in this.nodes, they are not automatically added)
                CON:
                when checking for duplicates, it could be ugly that a duplicate id is detected if one is in the nodes list and the other belongs to an adv graph 
                (user sees only those in this.nodes)
                */
                // this.nodes.push(...additionalNodes);
                this.updatePearl();
            },
            () => {}
        );
    }

    editAdvGraph() {
        this.openAdgGraphEditor(this.selectedAdvGraph).then(
            (advGraph: WizardAdvGraphEntry) => {
                this.advGraphs[this.advGraphs.indexOf(this.selectedAdvGraph)] = advGraph;
                this.selectedAdvGraph = advGraph;
                this.updatePearl();
            },
            () => {}
        );
    }

    private openAdgGraphEditor(advGraph?: WizardAdvGraphEntry) {
        const modalRef: NgbModalRef = this.modalService.open(AdvancedGraphEditor, new ModalOptions('lg'));
        modalRef.componentInstance.advGraph = advGraph;
        modalRef.componentInstance.customRange = this.customRange;
        modalRef.componentInstance.fields = this.fields;
		modalRef.componentInstance.nodes = this.nodes;
        return modalRef.result;
    }

    deleteAdvGraph() {
        this.advGraphs.splice(this.advGraphs.indexOf(this.selectedAdvGraph), 1);
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
        //nodes of advGraph
        this.advGraphs.forEach(g => {
            g.nodes.forEach(n => {
                n.getNodeSerializations(this.prefixMappings).forEach(ns => {
                    //skip annotation serialization (nodes defined in advGraph, since are not generated from fields, for sure have no annotations)
                    this.pearl += this.getIndent(indentCount) + ns.nodeDefinition + " .\n";
                })
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
                indentCount++;
            }
            s.triples.forEach(t => {
                this.pearl += this.getIndent(indentCount) + t + " .\n";
            })
            if (s.optional) {
                indentCount--;
                this.pearl += this.getIndent(indentCount) + "}\n"; //close optional
            }
        });

        this.advGraphs.forEach(g => {
            //the pattern is optional if it is seeded by an optional field
            let optional: boolean = g.fieldSeed.optional
            if (optional) {
                this.pearl += this.getIndent(indentCount) + "OPTIONAL {\n"; //open optional
                indentCount++;
            }

            let graphPatternRows = g.pattern.split("\n");
            for (let gp of graphPatternRows) {
                this.pearl += this.getIndent(indentCount) + gp +"\n";
            }
            if (optional) {
                indentCount--;
                this.pearl += this.getIndent(indentCount) + "}\n"; //close optional
            }
        })

        indentCount--;
        this.pearl += this.getIndent(indentCount) + "}\n"; //close graph
        this.pearl += "}"; //close rule

        //PREFIX
        //collected at the end in order to declare only those used
        let mappingsToSerializa: PrefixMapping[] = [];
        this.prefixMappings.forEach(m => {
            if (this.pearl.includes(m.prefix + ":")) {
                mappingsToSerializa.push(m);
            }
        })
        //coda prefix is always declared (if not already added)
        if (!mappingsToSerializa.some(m => m.namespace == ConverterContractDescription.NAMESPACE)) {
            mappingsToSerializa.push({ prefix: "coda", namespace: ConverterContractDescription.NAMESPACE, explicit: false });
        }
        //check additional mappings in adv graphs
        this.advGraphs.forEach(g => {
            Object.keys(g.prefixMapping).forEach(prefix => {
                if (this.pearl.includes(prefix + ":")) {
                    mappingsToSerializa.push({ prefix: prefix, namespace: g.prefixMapping[prefix], explicit: false });
                }
            })
        })
        let prefixDeclaration = "";
        mappingsToSerializa.forEach(m => {
            if (this.pearl.includes(m.prefix + ":")) {
                prefixDeclaration += "prefix\t" + m.prefix + ":\t<" + m.namespace + ">\n";
            }
        })

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
        //check on FIELDS
        if (this.customRange && this.fields.length == 0) {
            //in CustomRange at least a field is required (not in constructor where it can siply add info to the standard form)
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.FIELD_EMPTY" }, ModalType.warning);
            return false;
        }
        for (let i = 0; i < this.fields.length; i++) {
            let field = this.fields[i];
            //check on names
            if (field.label.trim() == "") { //invalid name
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.FIELD_INVALID_NAME", params: { position: (i + 1) } }, ModalType.warning);
                return false;
            }
            //look for duplicate
            if (this.fields.filter(f => f.label == field.label).length > 1) { //found more than 1 field with the name of the current one
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.FIELD_MULTIPLE_NAME", params: { name: field.label } }, ModalType.warning);
                return false;
            }
            //check if all constraints are ok
            if (field.constraint == ConstraintType.Datatype && (<WizardFieldLiteral>field).datatype == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.FIELD_INCOMPLETE_CONSTRAINT", params: { field: field.label, constraint: ConstraintType.Datatype } }, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.Enumeration && field.enumeration.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.FIELD_INCOMPLETE_CONSTRAINT", params: { field: field.label, constraint: ConstraintType.Enumeration } }, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.LangString) {
                if ((<WizardFieldLiteral>field).languageConstraint.type == LangConstraintType.Fixed && (<WizardFieldLiteral>field).languageConstraint.language == null) {
                    this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.FIELD_INCOMPLETE_CONSTRAINT", params: { field: field.label, constraint: ConstraintType.LangString } }, ModalType.warning);
                    return false;
                }
            }
            if (field.constraint == ConstraintType.Range && (<WizardFieldUri>field).ranges.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.FIELD_INCOMPLETE_CONSTRAINT", params: { field: field.label, constraint: ConstraintType.Range } }, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.Role && (<WizardFieldUri>field).roles.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.FIELD_INCOMPLETE_CONSTRAINT", params: { field: field.label, constraint: ConstraintType.Role } }, ModalType.warning);
                return false;
            }
        }

        //check on NODES
        //duplicates
        for (let n1 of this.nodes) {
            //check if exists a node different from the current but with the same id (both in nodes and in the nodes of advGraphs)
            if (this.nodes.some(n2 => n1 != n2 && n1.nodeId == n2.nodeId) || this.advGraphs.some(g => g.nodes.some(n2 => n1 != n2 && n1.nodeId == n2.nodeId))) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NODE_MULTIPLE_ID", params: { id: n1.nodeId } }, ModalType.warning);
                return false;
            }
        }
        //other individual check
        for (let n of this.nodes) {
            if (!CustomFormWizardUtils.checkNode(n, this.basicModals)) {
                return false;
            }
        }
        for (let g of this.advGraphs) { //nodes of advGraphs are already checked in the advGraph editor, anyway check them again
            for (let n of g.nodes) {
                if (!CustomFormWizardUtils.checkNode(n, this.basicModals)) {
                    return false;
                }
            }
        }
        

        //check on GRAPH
        if (this.graphs.length == 0) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NODE_RELATION_EMPTY" }, ModalType.warning);
            return false;
        }
        for (let i = 0; i < this.graphs.length; i++) {
            let g: WizardGraphEntry = this.graphs[i];
            if (this.customRange) {
                //first usage of graph entry point node cannot be optional
                if (i == 0 && g.subject instanceof WizardNodeEntryPoint && g.object instanceof WizardNodeFromField && g.object.fieldSeed.optional) {
                    this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.OPTIONAL_ENTRY_POINT_WARN", params: { id: g.subject.nodeId } }, ModalType.warning);
                    return false;
                }
            }
            if (g.predicate == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NODE_RELATION_MISSING_PREDICATE", params: { position: (i + 1) } }, ModalType.warning);
                return false;
            }
            if ((g.object.type == GraphObjectType.node && g.object.node == null) || (g.object.type == GraphObjectType.value && g.object.value == null)) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NODE_RELATION_MISSING_OBJECT", params: { position: (i + 1) } }, ModalType.warning);
                return false;
            }
        }
        //every check passed, data is ok
        return true;

    }

    //=== STATUS HANDLER

    storeStatus() {
        let status: WizardStatus = {
            customRange: this.customRange,
            fields: this.fields,
            nodes: this.nodes,
            graphs: this.graphs,
            advGraphs: this.advGraphs
        }
        this.downloadStatusFile(JSON.stringify(status, null, 4));
    }

    private downloadStatusFile(fileContent: string) {
        let data = new Blob([fileContent], { type: 'text/plain' });
        let textFile = window.URL.createObjectURL(data);
        let fileName = "cf_wizard_status.json";
        this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_STATUS" }, null, textFile, fileName).then(
            done => { window.URL.revokeObjectURL(textFile); },
            () => { }
        );
    }

    loadStatus() {
        this.basicModals.selectFile({key: "ACTIONS.LOAD_STATUS"}, null, "application/json").then(
            file => {
                let reader = new FileReader();
                reader.onload = (event) => {
	                let content: string = <string>event.target.result;
                    let statusJson = JSON.parse(content);
                    this.restoreStatus(statusJson)
                };
                reader.readAsText(file);
            },
            () => {}
        );
    }

    private restoreStatus(jsonContent: any) {
        if (jsonContent.customRange == undefined) { //lood at the customRange attribute to determine if the json file is a CF status
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NOT_VALID_STATUS" }, ModalType.warning);
            return;
        }
        let status: WizardStatus = WizardStatusUtils.restoreWizardStatus(jsonContent);
        if (this.customRange && !status.customRange) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NOT_CUSTOM_RANGE_STATUS" }, ModalType.warning);
            return;
        } else if (!this.customRange && status.customRange) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NOT_CUSTOM_CONSTRUCTOR_STATUS" }, ModalType.warning);
            return;
        }
        this.fields = status.fields;
        this.nodes = status.nodes;
        this.graphs = status.graphs;
        this.advGraphs = status.advGraphs;
        this.updatePearl();
    }


    ok() {
        if (this.checkData()) {
            this.cfService.validatePearl(this.pearl, "graph").subscribe(
                (result: PearlValidationResult) => {
                    if (!result.valid) {
                        this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, result.details, ModalType.warning);
                    } else {
                        this.activeModal.close(this.pearl);
                    }
                }
            );
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}
