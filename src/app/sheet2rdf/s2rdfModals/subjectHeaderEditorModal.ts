import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTNode, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { Pair } from "../../models/Shared";
import { CODAConverter, SimpleHeader, SubjectHeader } from "../../models/Sheet2RDF";
import { SKOS } from "../../models/Vocabulary";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

export class SubjectHeaderEditorModalData extends BSModalContext {
    constructor(public headers: SimpleHeader[], public subjectHeader: SubjectHeader) {
        super();
    }
}

@Component({
    selector: "subject-header-editor-modal",
    templateUrl: "./subjectHeaderEditorModal.html",
})
export class SubjectHeaderEditorModal implements ModalComponent<SubjectHeaderEditorModalData> {
    context: SubjectHeaderEditorModalData;

    private selectedHeader: SimpleHeader;

    private assertType: boolean = false;
    private type: ARTResource;

    private selectedConverter: CODAConverter;
    private memoize: boolean = false;

    private additionalPredObjs: PredObjPair[];

    constructor(public dialog: DialogRef<SubjectHeaderEditorModalData>, private s2rdfService: Sheet2RDFServices, 
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        /**
         * restore the previous subject header choices
         */
        //selected header
        this.context.headers.forEach(h => {
            if (h.id == this.context.subjectHeader.id) {
                this.selectedHeader = h;
            }
        });
        //type + type assertion
        this.type = <ARTResource>this.context.subjectHeader.typeGraph.value;
        if (this.type != null) {
            this.assertType = true;
        }
        //converter
        if (this.context.subjectHeader.node.converter != null) {
            this.selectedConverter = this.context.subjectHeader.node.converter;
            this.memoize = this.context.subjectHeader.node.memoize;
        }
        //additional po
        this.additionalPredObjs = [];
        this.context.subjectHeader.additionalGraphs.forEach(g => {
            this.additionalPredObjs.push({ predicate: g.property, object: g.value });
        })
    }

    private changeType() {
        this.browsingModals.browseClassTree("Select class").then(
            (cls: ARTURIResource) => {
                this.type = cls;
            }
        );
    }

    private onConverterUpdate(updateStatus: { converter: CODAConverter, memoize: boolean }) {
        this.selectedConverter = updateStatus.converter;
        this.memoize = updateStatus.memoize;
    }

    private addAdditionalPredObj() {
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
    private isOkEnabled() {
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
                this.basicModals.alert("Subject Header editor", "An incomplete additional predicate-object pair has been detected.", "warning");
                return;
            }
        }
        //prepare the additional PO param
        let additionalPOParam: Pair<ARTURIResource, ARTNode>[] = [];
        this.additionalPredObjs.forEach(po => {
            additionalPOParam.push({ first: po.predicate, second: po.object });
        });
        //execute the update
        this.s2rdfService.updateSubjectHeader(this.selectedHeader.id, this.selectedConverter.contractUri, additionalPOParam, this.selectedConverter.params,
            this.type, this.memoize).subscribe(
            () => {
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}

interface PredObjPair {
    predicate: ARTURIResource;
    object: ARTNode;
}