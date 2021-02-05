import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTResource } from "../../models/ARTResources";
import { CommitInfo } from "../../models/History";
import { NTriplesUtil } from "../../utils/ResourceUtils";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "operation-params-modal",
    templateUrl: "./operationParamsModal.html"
})
export class OperationParamsModal {
    @Input() commit: CommitInfo;

    constructor(public activeModal: NgbActiveModal, private sharedModals: SharedModalServices) {
    }

    private openValueResourceView(value: string) {
        try {
            let res: ARTResource;
            if (value.startsWith("<") && value.endsWith(">")) { //uri
                res = NTriplesUtil.parseURI(value);
            } else if (value.startsWith("_:")) { //bnode
                res = NTriplesUtil.parseBNode(value);
            }
            if (res != null) {
                this.sharedModals.openResourceView(res, true);
            }
        } catch (err) {
            //not parseable => not a resource
        } 
    }

    ok() {
        this.activeModal.close();
    }

}