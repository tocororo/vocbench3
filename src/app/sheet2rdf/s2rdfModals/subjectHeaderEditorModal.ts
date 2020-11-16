import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTNode, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { Pair } from "../../models/Shared";
import { CODAConverter, SimpleHeader, SubjectHeader } from "../../models/Sheet2RDF";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

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
        this.browsingModals.browseClassTree("Select class").then(
            (cls: ARTURIResource) => {
                this.type = cls;
            }
        );
    }

    onConverterUpdate(updateStatus: { converter: CODAConverter, memoize: boolean }) {
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
        let isSignatureOk: boolean = true;
        if (this.selectedConverter != null) {
            for (let key in this.selectedConverter.params) {
                let paramValue = this.selectedConverter.params[key];
                if (paramValue != null) { //param not null, check if it is ok according its type
                    if (typeof paramValue === "string" && paramValue.trim() == "") { //string must not be empty
                        isSignatureOk = false;
                    } else if (Array.isArray(paramValue)) { //array must not be empty or populated with empty value
                        if (paramValue.length == 0) {
                            isSignatureOk = false;
                        } else {
                            paramValue.forEach(v => {
                                if (v == null) {
                                    isSignatureOk = false;
                                }
                            });
                        }
                    } else if (typeof paramValue == "object") { //map must not have empty value
                        if (JSON.stringify(paramValue) == "{}") { //empty object
                            isSignatureOk = false;
                        } else {
                            for (let key in <any>paramValue) {
                                if (key == null || paramValue[key] == null) {
                                    isSignatureOk = false;
                                }
                            }
                        }
                    }
                } else { //param null
                    isSignatureOk = false;
                }
            }
        }
        
        return (
            this.selectedHeader != null && 
            (!this.assertType || this.type) &&
            this.selectedConverter != null &&
            isSignatureOk
        );
    }

    ok() {
        //check that there are no additional PO pending
        for (let po of this.additionalPredObjs) {
            if (po.predicate == null || po.object == null) {
                this.basicModals.alert("Subject Header editor", "An incomplete additional predicate-object pair has been detected.", ModalType.warning);
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