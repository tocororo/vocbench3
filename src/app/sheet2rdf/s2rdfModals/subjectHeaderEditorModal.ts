import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConverterContractDescription } from "src/app/models/Coda";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { ModalType, SelectionOption } from 'src/app/widget/modal/Modals';
import { ARTNode, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { Pair } from "../../models/Shared";
import { CODAConverter, MemoizeData, NodeConversion, S2RDFModel, SimpleHeader } from "../../models/Sheet2RDF";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { Sheet2RdfContextService } from "../sheet2rdfContext";

@Component({
    selector: "subject-header-editor-modal",
    templateUrl: "./subjectHeaderEditorModal.html",
})
export class SubjectHeaderEditorModal {
    @Input() sheetName: string;

    s2rdfModel: S2RDFModel;

    selectedHeader: SimpleHeader;

    assertType: boolean = false;
    type: ARTResource;

    selectedConverter: CODAConverter;
    memoizeData: MemoizeData;
    memoizedNodes: NodeConversion[];

    additionalPredObjs: PredObjPair[];

    constructor(public activeModal: NgbActiveModal, private s2rdfService: Sheet2RDFServices, private s2rdfCtx: Sheet2RdfContextService,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) {
    }

    ngOnInit() {
        this.s2rdfModel = this.s2rdfCtx.sheetModelMap.get(this.sheetName);
        /**
         * restore the previous subject header choices
         */
        //selected header
        this.s2rdfModel.headers.forEach(h => {
            if (h.id == this.s2rdfModel.subjectHeader.id) {
                this.selectedHeader = h;
            }
        });
        //type + type assertion
        this.type = <ARTResource>this.s2rdfModel.subjectHeader.graph.type;
        if (this.type != null) {
            this.assertType = true;
        }
        //converter
        if (this.s2rdfModel.subjectHeader.node.converter != null) {
            this.selectedConverter = this.s2rdfModel.subjectHeader.node.converter;
            this.memoizeData = { enabled: this.s2rdfModel.subjectHeader.node.memoize, id: this.s2rdfModel.subjectHeader.node.memoizeId };
        }
        //additional po
        this.additionalPredObjs = [];
        this.s2rdfModel.subjectHeader.additionalGraphs.forEach(g => {
            this.additionalPredObjs.push({ predicate: g.property, object: g.value });
        });

        this.initMemoizedNodes();
    }

    changeType() {
        this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.SELECT_CLASS" }).then(
            (cls: ARTURIResource) => {
                this.type = cls;
            }
        );
    }

    onConverterUpdate(updateStatus: ConverterConfigStatus) {
        this.selectedConverter = updateStatus.converter;
    }

    isConverterRandom() {
        return this.selectedConverter != null && this.selectedConverter.contractUri == ConverterContractDescription.NAMESPACE + "randIdGen";
    }

    private initMemoizedNodes() {
        //collect the nodes that uses the same memoization map
        let sourceNodes: NodeConversion[] = [];
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


    /* ============
    Additional predicate-objects 
    * ============ */

    addAdditionalPredObj() {
        this.additionalPredObjs.push({ predicate: null, object: null });
    }

    onAdditionalPropChanged(po: PredObjPair, prop: ARTURIResource) {
        po.predicate = prop;
    }

    onAdditionalObjChanged(po: PredObjPair, obj: ARTNode) {
        po.object = obj;
    }

    removeAdditionalPredObj(po: PredObjPair) {
        this.additionalPredObjs.splice(this.additionalPredObjs.indexOf(po), 1);
    }

    /**
     * Ok is enabled if
     * - header to use as subject is selected
     * - type assertion is true and a type is selected
     * - converter is selected
     * - all the parameters (if any) of the converter signature are provided
     */
    isOkEnabled() {
        let signatureOk: boolean = true;
        if (this.selectedConverter != null) {
            signatureOk = CODAConverter.isSignatureOk(this.selectedConverter);
        }
        return (
            this.selectedHeader != null &&
            (!this.assertType || this.type) &&
            this.selectedConverter != null &&
            signatureOk
        );
    }

    ok() {
        //check that there are no additional PO pending
        for (let po of this.additionalPredObjs) {
            if (po.predicate == null || po.object == null) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.INCOMPLETE_PRED_OBJ_PAIR" }, ModalType.warning);
                return;
            }
        }
        //prepare the additional PO param
        let additionalPOParam: Pair<ARTURIResource, ARTNode>[] = [];
        this.additionalPredObjs.forEach(po => {
            additionalPOParam.push({ first: po.predicate, second: po.object });
        });
        //execute the update
        let memoizePar: boolean = this.memoizeData ? this.memoizeData.enabled : null;
        let memoizeIdPar: string = this.memoizeData ? this.memoizeData.id : null;
        this.s2rdfService.updateSubjectHeader(this.sheetName, this.selectedHeader.id, this.selectedConverter.contractUri, this.selectedConverter.params,
            this.type, additionalPOParam, memoizePar, memoizeIdPar).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

interface PredObjPair {
    predicate: ARTURIResource;
    object: ARTNode;
}