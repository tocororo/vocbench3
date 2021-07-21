import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';
import { PrefixMapping } from "src/app/models/Metadata";
import { SKOS, SKOSXL } from "src/app/models/Vocabulary";
import { Sheet2RDFServices } from "src/app/services/sheet2rdfServices";
import { UIUtils } from "src/app/utils/UIUtils";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";
import { VBContext } from "../../../utils/VBContext";
import { ConverterConfigModal } from "./converterConfigModal";
import { CustomFormWizardUtils, SessionFeature, StandardFormFeature, WizardAdvGraphEntry, WizardField, WizardNode, WizardNodeEntryPoint, WizardNodeFromField, WizardNodeUserCreated, WizardStatusUtils } from "./CustomFormWizard";

@Component({
    selector: "advanced-graph-editor",
    templateUrl: "./advancedGraphEditor.html",
})
export class AdvancedGraphEditor {
    @Input() customRange: boolean; //tells if the wizard works for CustomRange (false if for Constructor)
    @Input() advGraph: WizardAdvGraphEntry; //if provided, works in edit mode
    @Input() fields: WizardField[]; //used for selecting the seed field of the graph pattern
    @Input() nodes: WizardNode[]; //nodes defined in the wizard, they can be referred in the pattern
        //(N.B.: in case there are references, the AdvG cannot be exported, since the description of an AdvG must be self-suffice and not depending on external factors not defined in it)

    @ViewChild('prefixnstable') prefixNsTableElement: ElementRef;
    globalPrefixMappings: PrefixMapping[] = [];
    localPrefixMappings: PrefixMapping[] = [];
    selectedMapping: PrefixMapping;

    sessionFeatures: SessionFeature[];
    stdFormFeatures: StandardFormFeature[];

    selectedField: WizardField;
    selectedFieldNodes: WizardNodeFromField[];

    newNodes: WizardNodeUserCreated[]; //nodes defined contextually in this adv graph
    graphPattern: string;

    constructor(public activeModal: NgbActiveModal, private s2rdfService: Sheet2RDFServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal,
        private elementRef: ElementRef) {
    }

    ngOnInit() {
        this.globalPrefixMappings = VBContext.getWorkingProjectCtx().getPrefixMappings();
        this.newNodes = [];
     
        this.sessionFeatures = [SessionFeature.user]; //available for both C.Range and C.Constructor
        //for custom constructor add the feature of stdForm
        if (!this.customRange) {
            this.stdFormFeatures = StandardFormFeature.getStdFeatures(VBContext.getWorkingProject().getModelType(), VBContext.getWorkingProject().getLexicalizationModelType())
        }

        if (this.advGraph != null) { //edit mode, restore the status
            this.selectedField = this.advGraph.fieldSeed;
            this.onFieldChange();
            this.restorePrefixNsMappings(this.advGraph.prefixMapping);
            this.advGraph.nodes.forEach(n => {
                //serialize and restore the node in order to clone them and to prevent that changes on them are permanent even if the dialog is closed with "Close" button
                this.newNodes.push(WizardStatusUtils.restoreWizardNode(JSON.parse(JSON.stringify(n)), this.fields));
            })
            this.graphPattern = this.advGraph.pattern;
        }
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    onFieldChange() {
        this.selectedFieldNodes = <WizardNodeFromField[]> this.nodes.filter(n => n instanceof WizardNodeFromField && n.fieldSeed == this.selectedField);
    }

    /*
     * ============= PREFIX-NS =================
     */

    private selectMapping(m: PrefixMapping) {
        if (!m.explicit) return;
        if (this.selectedMapping == m) {
            this.selectedMapping = null;
        } else {
            this.selectedMapping = m;
        }
    }

    addMapping() {
        this.sharedModals.prefixNamespace({key:"ACTIONS.ADD_PREFIX_NAMESPACE_MAPPING"}).then(
            (mapping: { prefix: string, namespace: string }) => {
                //check if the prefix or the namespace are not already defined
                if (
                    this.globalPrefixMappings.some(m => m.prefix == mapping.prefix) || 
                    this.localPrefixMappings.some(m => m.prefix == mapping.prefix)
                ) {
                    this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key:"MESSAGES.ALREADY_DEFINED_MAPPING_WITH_PREFIX"}, ModalType.warning);
                } else if (
                    this.globalPrefixMappings.some(m => m.namespace == mapping.namespace) || 
                    this.localPrefixMappings.some(m => m.namespace == mapping.namespace)
                ) {
                    this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key:"MESSAGES.ALREADY_DEFINED_MAPPING_WITH_NAMESPACE"}, ModalType.warning);
                } else { //not used => add it
                    let newMapping = { prefix: mapping.prefix, namespace: mapping.namespace, explicit: true };
                    this.localPrefixMappings.push(newMapping);
                    setTimeout(() => {
                        this.prefixNsTableElement.nativeElement.scrollTop = this.prefixNsTableElement.nativeElement.scrollHeight;
                        this.selectMapping(newMapping);
                    });
                }
            }
        );
    }

    removeMapping() {
        this.localPrefixMappings.splice(this.localPrefixMappings.indexOf(this.selectedMapping), 1);
        this.selectedMapping = null;
    }
    
    /**
     * Adds the given mappings into localPrefixMappings
     */
    private restorePrefixNsMappings(mappings: {[prefix: string]: string}) {
        for (let prefix in mappings) {
            /** 
             * If the mappings is not already in the globalPrefixMappings, add it into the localPrefixMappings.
             * TODO: if the mappings is not in the globalPrefixMappings, but the prefix is already in use?
             * do not add the mapping and replace the prefix in the pattern?
             */
            if (!this.globalPrefixMappings.some((gp: PrefixMapping) => gp.prefix == prefix && gp.namespace == mappings[prefix])) {
                this.localPrefixMappings.push({ prefix: prefix, namespace: mappings[prefix], explicit: true })
            }
        }
    }

    /*
     * ============== NODES ==================
     */

    addNode() {
        let nodeId = "new_node";
        let i = 1;
        while (this.nodes.some(n => n.nodeId == nodeId) || this.newNodes.some(n => n.nodeId == nodeId)) {
            nodeId = "new_node" + i;
            i++;
        }
        let newNode: WizardNodeUserCreated = new WizardNodeUserCreated(nodeId);
        this.newNodes.push(newNode);
    }

    removeNode(node: WizardNodeUserCreated) {
        this.newNodes.splice(this.newNodes.indexOf(node), 1);
    }

    editNodeConverter(node: WizardNode) {
        const modalRef: NgbModalRef = this.modalService.open(ConverterConfigModal, new ModalOptions('xl'));
        modalRef.componentInstance.converter = node.converterStatus != null ? node.converterStatus.converter : null;
        modalRef.result.then(
            (data: ConverterConfigStatus) => {
                node.converterStatus = data;
                node.updateConverterSerialization(VBContext.getPrefixMappings());
            },
            () => { }
        );
    }


    /*
     * ============= GRAPHS =================
     */

    private validatePattern() {
        /**
         * Creates a fake complete pearl rule just for pass it to the validateGraphPattern service.
         */
        let pearl: string = "";
        //PREFIX
        this.globalPrefixMappings.forEach(m => {
            pearl += "prefix " + m.prefix + ": <" + m.namespace + ">\n";
        });
        this.localPrefixMappings.forEach(m => {
            pearl += "prefix " + m.prefix + ": <" + m.namespace + ">\n";
        });
        pearl += "rule it.uniroma2.art.FakeRule id:rule {\n";
        //NODES
        pearl += "nodes = {\n";
        // - nodes of this graph application
        //(nodes are necessary just for checking if those used in the graph pattern are defined, so specify just the nodeIDs and use a placeholder converter)
        this.nodes.forEach(n => {
            pearl += n.nodeId + " uri test .\n";
        });
        this.newNodes.forEach(n => {
            pearl += n.nodeId + " uri test .\n";
        });
        pearl += "}\n"; //close nodes
        //GRAPH
        pearl += "graph = {\n";
        pearl += this.graphPattern + "\n";
        pearl += "}\n"; //close graph
        pearl += "}\n"; //close rule

        return this.s2rdfService.validateGraphPattern(pearl).pipe(
            map(validation => {
                if (!validation.valid) {
                    this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_GRAPH_PATTERN"}, ModalType.warning, validation.details);
                    return validation;
                } else {
                    validation.usedNodes.forEach((nodeId, index, list) => {
                        list[index] = nodeId.substring(1); //removes the leading $
                    })
                    if (this.customRange && validation.usedNodes.includes(WizardNodeEntryPoint.NodeID)) {
                        validation.usedNodes.splice(validation.usedNodes.indexOf(WizardNodeEntryPoint.NodeID), 1);
                    }
                    return validation;
                }
            })
        );
    }

    isOkEnabled(): boolean {
        return (this.newNodes.length > 0 || this.nodes.length > 0) && this.graphPattern != null && this.graphPattern.trim() != "";
    }

    ok() {
        //check on newNodes:
        for (let n1 of this.newNodes) {
            //check duplicated id in the newNodes and nodes list
            if (this.newNodes.some(n2 => n1 != n2 && n1.nodeId == n2.nodeId) || this.nodes.some(n2 => n1.nodeId == n2.nodeId)) { 
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "CUSTOM_FORMS.WIZARD.MESSAGES.NODE_MULTIPLE_ID", params: { id: n1.nodeId } }, ModalType.warning);
                return;
            }
        }
        for (let n of this.newNodes) {
            //other individual check
            if (!CustomFormWizardUtils.checkNode(n, this.basicModals)) {
                return;
            }
        }

        this.validatePattern().subscribe(
            validation => {
                if (validation.valid) {
                    let referencedNodes: WizardNode[] = [];
                    let advGrNodes: WizardNodeUserCreated[] = []; //nodes defined only here and actually used in the graph pattern
                    validation.usedNodes.forEach(nId => {
                        let n = this.nodes.find(n => n.nodeId == nId); //search in already defined nodes
                        if (n != null) {
                            referencedNodes.push(n)
                        } else {
                            n = this.newNodes.find(n => n.nodeId == nId); //search in new defined nodes
                            if (n != null) {
                                advGrNodes.push(n)
                            }
                        }
                    })

                    let advGrMappings: {[key: string]: string} = {}; //prefix mapping defined locally in this adv-g
                    validation.usedPrefixes.forEach(prefix => {
                        for (let m of this.localPrefixMappings) {
                            if (m.prefix == prefix) {
                                advGrMappings[prefix] = m.namespace;
                                break;
                            }
                        };
                    });

                    let returnData: WizardAdvGraphEntry = {
                        fieldSeed: this.selectedField,
                        nodes: advGrNodes,
                        referencedNodes: referencedNodes,
                        prefixMapping: advGrMappings,
                        pattern: this.graphPattern
                    }
                    this.activeModal.close(returnData);
                }
            }
        )
    }

    cancel() {
        this.activeModal.dismiss();
    }

}