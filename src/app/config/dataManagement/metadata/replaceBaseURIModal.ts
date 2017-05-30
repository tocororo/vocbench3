import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { RefactorServices } from "../../../services/refactorServices";
import { ARTURIResource } from "../../../models/ARTResources";
import { VBPreferences } from "../../../utils/VBPreferences";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

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
        private preferences: VBPreferences, private basicModals: BasicModalServices) {
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

        this.basicModals.confirm("Replace baseURI", "This operation could be a long process. Are you sure to proceed?", "warning").then(
            confirm => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.refactorService.replaceBaseURI(this.newBaseURI, this.oldBaseURI).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        //remove schemes which defaultBaseURI was replaced
                        let activeSchemes = this.preferences.getActiveSchemes();
                        let updatedActiveSchemes: ARTURIResource[] = [];
                        for (var i = 0; i < activeSchemes.length; i++) {
                            if (!activeSchemes[i].getURI().startsWith(this.oldBaseURI)) {
                                updatedActiveSchemes.push(activeSchemes[i]);
                            }
                        }
                        this.preferences.setActiveSchemes(updatedActiveSchemes);
                        event.stopPropagation();
                        event.preventDefault();
                        this.dialog.close();
                    }
                );
            },
            () => { }
        )
    }

    cancel() {
        this.dialog.dismiss();
    }

}