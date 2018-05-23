import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { CommitInfo } from "../models/History";
import { ARTResource, ResourceUtils } from "../models/ARTResources";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

export class OperationParamsModalData extends BSModalContext {
    constructor(public commit: CommitInfo) {
        super();
    }
}

@Component({
    selector: "operation-params-modal",
    templateUrl: "./operationParamsModal.html"
})
export class OperationParamsModal implements ModalComponent<OperationParamsModalData> {
    context: OperationParamsModalData;

    constructor(public dialog: DialogRef<OperationParamsModalData>, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    private openValueResourceView(value: string) {
        try {
            let res: ARTResource;
            if (value.startsWith("<") && value.endsWith(">")) { //uri
                res = ResourceUtils.parseURI(value);
            } else if (value.startsWith("_:")) { //bnode
                res = ResourceUtils.parseBNode(value);
            }
            if (res != null) {
                this.sharedModals.openResourceView(res, true);
            }
        } catch (err) {
            //not parseable => not a resource
        } 
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}