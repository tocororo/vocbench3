import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {RefactorServices} from "../../../services/refactorServices";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {ModalServices} from "../../../widget/modal/modalServices";

export class ReplaceBaseURIModalData extends BSModalContext {
    /**
     * @param baseURI defualt baseuri
     */
    constructor(
        public baseURI: string
    ) {
        super();
        this.keyboard = null;
    }
}

@Component({
    selector: "replace-baseuri-modal",
    templateUrl: "./replaceBaseURIModal.html",
})
export class ReplaceBaseURIModal implements ModalComponent<ReplaceBaseURIModalData> {
    context: ReplaceBaseURIModalData;
    
    private useDefaultBaseURI: boolean = false;
    private oldBaseURI: string;
    private newBaseURI: string;
    
    private submittedWithError: boolean = false;
    private errorMsg: string;
    
    constructor(public dialog: DialogRef<ReplaceBaseURIModalData>, public refactorService: RefactorServices,
        private modalService: ModalServices, private vbCtx: VocbenchCtx) {
        this.context = dialog.context;
    }
    
    private onCheckChange() {
        if (this.useDefaultBaseURI) {
            this.oldBaseURI = this.context.baseURI;
        } else {
            this.oldBaseURI = "";
        }
    }
    
    ok(event) {
        if (!this.oldBaseURI.startsWith("http://")) {
            this.errorMsg = "Invalid Old baseURI";
            this.submittedWithError = true;
            return;
        }
        if (!this.newBaseURI.startsWith("http://")) {
            this.errorMsg = "Invalid New baseURI";
            this.submittedWithError = true;
            return;
        }
        
        this.modalService.confirm("Replace baseURI", "This operation could be a long process. Are you sure to proceed?", "warning").then(
            confirm => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.refactorService.replaceBaseURI(this.newBaseURI, this.oldBaseURI).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        //remove scheme if defaultBaseURI was replaced
                        if (this.vbCtx.getScheme() && this.vbCtx.getScheme().getURI().startsWith(this.oldBaseURI)) {
                            this.vbCtx.removeScheme(this.vbCtx.getWorkingProject());
                        }
                        event.stopPropagation();
                        event.preventDefault();
                        this.dialog.close();
                    },
                    err => document.getElementById("blockDivFullScreen").style.display = "none"
                );
            },
            () => {}
        )
    }

    cancel() {
        this.dialog.dismiss();
    }

}