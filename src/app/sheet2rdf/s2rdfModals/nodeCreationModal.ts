import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { ConverterContractDescription } from "src/app/models/Coda";
import { Sheet2RDFServices } from "src/app/services/sheet2rdfServices";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { ModalType, SelectionOption } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { CODAConverter, MemoizeData, NodeConversion, S2RDFModel, SimpleHeader } from "../../models/Sheet2RDF";
import { RangeType } from "../../services/propertyServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { Sheet2RdfContextService } from "../sheet2rdfContext";

@Component({
    selector: "node-creation-modal",
    templateUrl: "./nodeCreationModal.html",
})
export class NodeCreationModal {
    @Input() sheetName: string;
    @Input() header: SimpleHeader;
    @Input() editingNode: NodeConversion;
    @Input() constrainRangeType: boolean;
    @Input() rangeTypeConfig: { type: RangeType, lock: boolean } = { type: null, lock: false };
    @Input() constrainedLanguage: string;
    @Input() constrainedDatatype: ARTURIResource;
    @Input() headerNodes: NodeConversion[]; //other nodes of the input header 
    //(I don't use header.nodes, despite most of the time these nodes are the same, since they may differ. 
    //E.g. when this modal is called from the AdvancedGraphApplication modal, nodes can be created contextually the definition of the AGA so they are not in the header yet)

    private s2rdfModel: S2RDFModel;

    nodeId: string;

    rangeTypes: RangeType[] = [RangeType.resource, RangeType.literal];
    rangeType: RangeType;

    selectedConverter: CODAConverter;
    memoizeData: MemoizeData = new MemoizeData();
    memoizedNodes: NodeConversion[];

    constructor(public activeModal: NgbActiveModal, private s2rdfService: Sheet2RDFServices, private s2rdfCtx: Sheet2RdfContextService, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        document.getElementById("toFocus").focus();
        this.s2rdfModel = this.s2rdfCtx.sheetModelMap.get(this.sheetName);

        this.rangeType = this.rangeTypeConfig.type;

        if (this.editingNode) {
            this.nodeId = this.editingNode.nodeId;
            this.selectedConverter = this.editingNode.converter;
            this.memoizeData = { enabled: this.editingNode.memoize, id: this.editingNode.memoizeId };
        }

        this.initMemoizedNodes();
    }

    onRangeTypeChanged() {
        this.selectedConverter = null;
    }

    onConverterUpdate(updateStatus: ConverterConfigStatus) {
        this.selectedConverter = updateStatus.converter;
    }

    isConverterRandom() {
        return this.selectedConverter != null && this.selectedConverter.contractUri == ConverterContractDescription.NAMESPACE + "randIdGen";
    }

    private isNodeAlreadyInUse(nodeId: string): Observable<boolean> {
        if (this.editingNode) { //in case the modal is editing a pre-existing node, skip the test and return false
            return of(false);
        } else {
            for (let n of this.headerNodes) {
                if (n.nodeId == nodeId) {
                    return of(true);
                }
            }
            //if this code is reached, the id is not used locally in the header => check globally invoking the server
            return this.s2rdfService.isNodeIdAlreadyUsed(this.sheetName, nodeId);
        }
    }

    private initMemoizedNodes() {
        //collect the nodes that uses the same memoization map
        let sourceNodes: NodeConversion[] = [];
        //from nodes of the current header
        if (this.headerNodes != null) {
            this.headerNodes.forEach(n => {
                if (n.memoize) {
                    if (!sourceNodes.some(sn => sn.nodeId == n.nodeId)) { //collect it if not yet in the sourceNodes list
                        sourceNodes.push(n);
                    }
                }
            });
        }
        //from the subject header
        if (this.s2rdfModel.subjectHeader.node.memoize) {
            if (!sourceNodes.some(sn => sn.nodeId == this.s2rdfModel.subjectHeader.node.nodeId)) { //collect it if not yet in the sourceNodes list
                sourceNodes.push(this.s2rdfModel.subjectHeader.node);
            }
        }
        //from all the other headers
        this.s2rdfModel.headers.forEach(h => {
            h.nodes.forEach(n => {
                if (n.memoize) {
                    if (!sourceNodes.some(sn => sn.nodeId == n.nodeId)) { //collect it if not yet in the sourceNodes list
                        sourceNodes.push(n);
                    }
                }
            });
        });
        this.memoizedNodes = sourceNodes.length > 0 ? sourceNodes : null;
    }

    selectNodeToBind() {
        let opts: SelectionOption[] = this.memoizedNodes.map(n => {
            return {
                value: n.nodeId,
                description: "(Memoization map ID: " + (n.memoizeId ? n.memoizeId : "Default") + ")"
            };
        });
        this.basicModals.select({ key: "SHEET2RDF.HEADER_EDITOR.COPY_MEMOIZED_NODE_CONVERTER" }, { key: "SHEET2RDF.HEADER_EDITOR.SELECT_MEMOIZED_NODE" }, opts).then(
            (opt: SelectionOption) => {
                let selectedSourceMemoNode: NodeConversion = this.memoizedNodes.find(n => n.nodeId == opt.value);
                this.memoizeData = {
                    enabled: selectedSourceMemoNode.memoize,
                    id: selectedSourceMemoNode.memoizeId
                };
                this.selectedConverter = selectedSourceMemoNode.converter;
            },
            () => { }
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
        this.isNodeAlreadyInUse(this.nodeId).subscribe(
            used => {
                if (used) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.ALREADY_USED_NODE_ID" }, ModalType.warning);
                    return;
                }
                let newNode: NodeConversion = {
                    nodeId: this.nodeId,
                    converter: this.selectedConverter,
                    memoize: this.memoizeData ? this.memoizeData.enabled : false,
                    memoizeId: (this.memoizeData && this.memoizeData.enabled) ? this.memoizeData.id : null,
                };
                this.activeModal.close(newNode);
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}