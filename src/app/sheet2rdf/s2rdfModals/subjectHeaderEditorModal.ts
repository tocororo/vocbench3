import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { CODAConverter, SimpleHeader, SubjectHeader } from "../../models/Sheet2RDF";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
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
    private type: ARTURIResource;

    private selectedConverter: CODAConverter;
    private memoize: boolean = false;

    constructor(public dialog: DialogRef<SubjectHeaderEditorModalData>, private s2rdfService: Sheet2RDFServices, 
        private browsingModals: BrowsingModalServices) {
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
        this.type = this.context.subjectHeader.graph.type;
        if (this.type != null) {
            this.assertType = true;
        }
        //converter
        if (this.context.subjectHeader.node.converter != null) {
            this.selectedConverter = this.context.subjectHeader.node.converter;
            this.memoize = this.context.subjectHeader.node.memoize;
        }
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
        this.s2rdfService.updateSubjectHeader(this.selectedHeader.id, this.selectedConverter.contract, this.selectedConverter.params,
            this.type, this.memoize).subscribe(
            resp => {
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}