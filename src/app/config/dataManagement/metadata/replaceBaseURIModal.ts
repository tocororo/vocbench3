import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { RefactorServices } from "../../../services/refactorServices";
import { VBPreferences } from "../../../utils/VBPreferences";
import { UIUtils } from "../../../utils/UIUtils";
import { ModalServices } from "../../../widget/modal/modalServices";

export class ReplaceBaseURIModalData extends BSModalContext {
    /**
     * @param baseURI defualt baseuri
     */
    constructor(
        public baseURI: string
    ) {
        super();
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
        private preferences: VBPreferences, private modalService: ModalServices) {
        this.context = dialog.context;
    }

    private onCheckChange() {
        if (this.useDefaultBaseURI) {
            this.oldBaseURI = this.context.baseURI;
        } else {
            this.oldBaseURI = "";
        }
    }

    ok(event: Event) {
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
                UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
                this.refactorService.replaceBaseURI(this.newBaseURI, this.oldBaseURI).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                        //remove scheme if defaultBaseURI was replaced
                        let activeScheme = this.preferences.getActiveScheme();
                        if (activeScheme != null && activeScheme.getURI().startsWith(this.oldBaseURI)) {
                            this.preferences.setActiveScheme(null);
                        }
                        event.stopPropagation();
                        event.preventDefault();
                        this.dialog.close();
                    },
                    err => UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"))
                );
            },
            () => { }
        )
    }

    cancel() {
        this.dialog.dismiss();
    }

}