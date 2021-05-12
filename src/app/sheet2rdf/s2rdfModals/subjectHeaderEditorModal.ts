import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTNode, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { Pair } from "../../models/Shared";
import { CODAConverter, SimpleHeader, SubjectHeader } from "../../models/Sheet2RDF";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { ConverterConfigStatus } from "./converterConfig/converterConfigurationComponent";

@Component({
    selector: "subject-header-editor-modal",
    templateUrl: "./subjectHeaderEditorModal.html",
})
export class SubjectHeaderEditorModal {
    @Input() headers: SimpleHeader[];
    @Input() subjectHeader: SubjectHeader;

    selectedHeader: SimpleHeader;

    assertType: boolean = false;
    type: ARTResource;

    selectedConverter: CODAConverter;
    memoize: boolean = false;

    additionalPredObjs: PredObjPair[];

    constructor(public activeModal: NgbActiveModal, private s2rdfService: Sheet2RDFServices, 
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) {
    }

    ngOnInit() {
        /**
         * restore the previous subject header choices
         */
        //selected header
        this.headers.forEach(h => {
            if (h.id == this.subjectHeader.id) {
                this.selectedHeader = h;
            }
        });
        //type + type assertion
        this.type = <ARTResource>this.subjectHeader.graph.type;
        if (this.type != null) {
            this.assertType = true;
        }
        //converter
        if (this.subjectHeader.node.converter != null) {
            this.selectedConverter = this.subjectHeader.node.converter;
            this.memoize = this.subjectHeader.node.memoize;
        }
        //additional po
        this.additionalPredObjs = [];
        this.subjectHeader.additionalGraphs.forEach(g => {
            this.additionalPredObjs.push({ predicate: g.property, object: g.value });
        })
    }

    changeType() {
        this.browsingModals.browseClassTree({key:"DATA.ACTIONS.SELECT_CLASS"}).then(
            (cls: ARTURIResource) => {
                this.type = cls;
            }
        );
    }

    onConverterUpdate(updateStatus: ConverterConfigStatus) {
        this.selectedConverter = updateStatus.converter;
        this.memoize = updateStatus.memoize;
    }

    addAdditionalPredObj() {
        this.additionalPredObjs.push({ predicate: null, object: null });
    }

    private onAdditionalPropChanged(po: PredObjPair, prop: ARTURIResource) {
        po.predicate = prop;
    }

    private onAdditionalObjChanged(po: PredObjPair, obj: ARTNode) {
        po.object = obj;
    }

    private removeAdditionalPredObj(po: PredObjPair) {
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
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.INCOMPLETE_PRED_OBJ_PAIR"}, ModalType.warning);
                return;
            }
        }
        //prepare the additional PO param
        let additionalPOParam: Pair<ARTURIResource, ARTNode>[] = [];
        this.additionalPredObjs.forEach(po => {
            additionalPOParam.push({ first: po.predicate, second: po.object });
        });
        //execute the update
        this.s2rdfService.updateSubjectHeader(this.selectedHeader.id, this.selectedConverter.contractUri, this.selectedConverter.params,
            this.type, additionalPOParam, this.memoize).subscribe(
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