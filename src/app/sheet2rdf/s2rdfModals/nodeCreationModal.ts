import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { ConverterContractDescription } from "src/app/models/Coda";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource, RDFTypesEnum } from "../../models/ARTResources";
import { CODAConverter, MemoizeData, NodeConversion, SimpleHeader } from "../../models/Sheet2RDF";
import { RangeType } from "../../services/propertyServices";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
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
    @Input() headerNodes: NodeConversion[]

    nodeId: string;

    selectedConverter: CODAConverter;
    memoizeData: MemoizeData = new MemoizeData();

    constructor(public activeModal: NgbActiveModal, private s2rdfService: Sheet2RDFServices, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        document.getElementById("toFocus").focus();
        if (this.editingNode) {
            this.nodeId = this.editingNode.nodeId;
            this.selectedConverter = this.editingNode.converter;
            this.memoizeData = { enabled:  this.editingNode.memoize, id: this.editingNode.memoizeId };
        }
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
            return this.s2rdfService.isNodeIdAlreadyUsed(nodeId);
        }
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
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

class HeaderRangeType {
    type: RDFTypesEnum;
    show: string;
}