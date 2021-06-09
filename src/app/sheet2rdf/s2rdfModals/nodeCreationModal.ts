import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConverterContractDescription } from "src/app/models/Coda";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { ModalType, SelectionOption } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { CODAConverter, MemoizeData, NodeConversion, SimpleHeader } from "../../models/Sheet2RDF";
import { RangeType } from "../../services/propertyServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "node-creation-modal",
    templateUrl: "./nodeCreationModal.html",
})
export class NodeCreationModal {
    @Input() header: SimpleHeader;
    @Input() editingNode: NodeConversion;
    @Input() constrainedRangeType: RangeType;
    @Input() constrainedLanguage: string;
    @Input() constrainedDatatype: ARTURIResource;
    @Input() headerNodes: NodeConversion[]; //other nodes of the input header 
        //(I don't use header.nodes, despite most of the time these nodes are the same, since they may differ. 
        //E.g. when this modal is called from the AdvancedGraphApplication modal, nodes can be created contextually the definition of the AGA so they are not in the header yet)
    @Input() headers: SimpleHeader[]; //other headers, useful for copying the memoization convertion

    nodeId: string;

    selectedConverter: CODAConverter;
    memoizeData: MemoizeData = new MemoizeData();

    memoizedNodes: NodeConversion[];
    selectedSourceMemoNode: NodeConversion;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        document.getElementById("toFocus").focus();
        if (this.editingNode) {
            this.nodeId = this.editingNode.nodeId;
            this.selectedConverter = this.editingNode.converter;
            this.memoizeData = { enabled:  this.editingNode.memoize, id: this.editingNode.memoizeId };
        }
        this.initMemoizedNodes();
    }

    onConverterUpdate(updateStatus: ConverterConfigStatus) {
        this.selectedConverter = updateStatus.converter;
    }

    isConverterRandom() {
        return this.selectedConverter != null && this.selectedConverter.contractUri == ConverterContractDescription.NAMESPACE + "randIdGen";
    }

    private isNodeAlreadyInUse(nodeId: string): boolean {
        if (this.editingNode) { //in case the modal is editing a pre-existing node, skip the test and return false
            return false;
        } else {
            for (let n of this.headerNodes) {
                if (n.nodeId == nodeId) {
                    return true;
                }
            }
            for (let h of this.headers) {
                for (let n of h.nodes) {
                    if (n.nodeId == nodeId) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    initMemoizedNodes() {
        let sourceNodes: NodeConversion[] = [];
        //collect the nodes that uses the same memoization map
        if (this.headerNodes != null) {
            this.headerNodes.forEach(n => {
                if (n.memoize) {
                    if (!sourceNodes.some(sn => sn.nodeId == n.nodeId)) { //collect it if not yet in the sourceNodes list
                        sourceNodes.push(n);
                    }
                }
            });
        }
        this.headers.forEach(h => {
            h.nodes.forEach(n => {
                if (n.memoize) {
                    if (!sourceNodes.some(sn => sn.nodeId == n.nodeId)) { //collect it if not yet in the sourceNodes list
                        sourceNodes.push(n);
                    }
                }
            })
        })
        this.memoizedNodes = sourceNodes.length > 0 ? sourceNodes : null;
    }

    selectNodeToBind() {
        let opts: SelectionOption[] = this.memoizedNodes.map(n => {
            return {
                value: n.nodeId,
                description: "(Memoization map ID: " + (n.memoizeId ? n.memoizeId : "Default") + ")"
            }
        });
        this.basicModals.select({key:"SHEET2RDF.HEADER_EDITOR.COPY_MEMOIZED_NODE_CONVERTER"}, {key:"SHEET2RDF.HEADER_EDITOR.SELECT_MEMOIZED_NODE"}, opts).then(
            (opt: SelectionOption) => {
                this.selectedSourceMemoNode = this.memoizedNodes.find(n => n.nodeId == opt.value);
                this.memoizeData = { 
                    enabled: this.selectedSourceMemoNode.memoize,
                    id: this.selectedSourceMemoNode.memoizeId
                }
                this.selectedConverter = this.selectedSourceMemoNode.converter;
            },
            () => {}
        );
    }

    
    /**
     * Ok is enabled if
     * - node id is provided (and it is valid)
     * - converter is selected
     * - all the parameters (if any) of the converter signature are provided
     * - the further info of the default literal converter (if selected) are provided
     */
     isOkEnabled() {
        let signatureOk: boolean = true;
        if (this.selectedConverter != null) {
            signatureOk = CODAConverter.isSignatureOk(this.selectedConverter);
        }
        return (
            this.nodeId != null && this.nodeId.trim() != "" &&
            this.selectedConverter != null &&
            signatureOk
        );
    }

    ok() {
        if (this.isNodeAlreadyInUse(this.nodeId)) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.ALREADY_USED_NODE_ID"}, ModalType.warning);
            return;
        }
        let newNode: NodeConversion = { 
            nodeId: this.nodeId,
            converter: this.selectedConverter,
            memoize: this.memoizeData.enabled,
            memoizeId: (this.memoizeData.enabled) ? this.memoizeData.id : null,
        }
        this.activeModal.close(newNode);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}