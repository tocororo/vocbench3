import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PrefixMapping } from "src/app/models/Metadata";
import { CODAConverter } from "src/app/models/Sheet2RDF";
import { CODAServices } from "src/app/services/codaServices";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { VBContext } from "src/app/utils/VBContext";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { ModalType } from "src/app/widget/modal/Modals";
import { ConverterContractDescription, PearlValidationResult, RDFCapabilityType, RequirementLevels, SignatureDescription } from "../../../models/Coda";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ConstraintType, GraphEntrySerialization, GraphObjectType, LangConstraintType, WizardField, WizardFieldLiteral, WizardFieldUri, WizardGraphEntry, WizardNode, WizardNodeEntryPoint, WizardNodeFromField } from "./CustomFormWizard";
import { WizardFieldChangeEvent, WizardFieldEventType } from "./customFormWizardFieldsEditor";

@Component({
    selector: "custom-form-wizard-modal",
    templateUrl: "./customFormWizardModal.html",
})
export class CustomFormWizardModal {

    /*
    TODO:
    - distinguere creazione di CustomForm e CustomConstructor (entry point non necessario)
    */

    @Input() formId: string = "FORM_ID";

    customRange: boolean = true; //tells if the wizard creates a CustomRange or a CustomConstructor

    private prefixMappings: PrefixMapping[];
    private converters: ConverterContractDescription[];

    //fields
    fields: WizardField[];
    //nodes
    nodes: WizardNode[];
    //graph
    graphs: WizardGraphEntry[];

    pearl: string;

    constructor(private activeModal: NgbActiveModal, private elementRef: ElementRef, private cfService: CustomFormsServices, private codaService: CODAServices,
        private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.prefixMappings = VBContext.getWorkingProjectCtx().getPrefixMappings();

        this.fields = [];

        let entryPoint: WizardNodeEntryPoint = new WizardNodeEntryPoint();
        this.nodes = [entryPoint];

        let g: WizardGraphEntry = new WizardGraphEntry(entryPoint);
        this.graphs = [g];

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
            //remove all the reference of the removed node in both nodes and graphs list
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
        //check on FIELDS
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

        //check on NODES
        //duplicates
        for (let n1 of this.nodes) {
            if (this.nodes.some(n2 => n1 != n2 && n1.nodeId == n2.nodeId)) { //exist a node different from the current but with the same id
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Multiple nodes with the same ID '" + n1.nodeId + "'", ModalType.warning);
                return false;
            }
        }
        //other individual check
        for (let n of this.nodes) {
            if (!this.checkNode(n)) {
                return false;
            }
        }

        //check on GRAPH
        if (this.graphs.length == 0) {
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "No relation between nodes has been provided", ModalType.warning);
            return false;
        }
        for (let i = 0; i < this.graphs.length; i++) {
            let g: WizardGraphEntry = this.graphs[i];
            if (i == 0 && g.object instanceof WizardNodeFromField && g.object.fieldSeed.optional) { //first usage of graph entry point node cannot be optional
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "The first usage of the " + g.subject.nodeId + " in the graph section cannot use an optional field", ModalType.warning);
                return false;
            }
            if (g.predicate == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Missing predicate in node relation at position " + (i + 1), ModalType.warning);
                return false;
            }
            if ((g.object.type == GraphObjectType.node && g.object.node == null) || (g.object.type == GraphObjectType.value && g.object.value == null)) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Missing object in node relation at position " + (i + 1), ModalType.warning);
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
