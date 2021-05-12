import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource, RDFTypesEnum } from "../../models/ARTResources";
import { CODAConverter, NodeConversion, SimpleHeader } from "../../models/Sheet2RDF";
import { RangeType } from "../../services/propertyServices";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ConverterConfigStatus } from "./converterConfig/converterConfigurationComponent";

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
    memoize: boolean = false;

    constructor(public activeModal: NgbActiveModal, private s2rdfService: Sheet2RDFServices, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        document.getElementById("toFocus").focus();
        if (this.editingNode) {
            this.nodeId = this.editingNode.nodeId;
            this.selectedConverter = this.editingNode.converter;
        }
        // this.nodeId = this.context.header.pearlFeature + "_node";
    }

    onConverterUpdate(updateStatus: ConverterConfigStatus) {
        this.selectedConverter = updateStatus.converter;
        this.memoize = updateStatus.memoize;
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

    ok() {
        this.isNodeAlreadyInUse(this.nodeId).subscribe(
            used => {
                if (used) {
                    this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.ALREADY_USED_NODE_ID"}, ModalType.warning);
                    return;
                }
                let newNode: NodeConversion = { nodeId: this.nodeId, converter: this.selectedConverter, memoize: this.memoize }
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