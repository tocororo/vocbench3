import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { HistoryServices } from "../services/historyServices";
import { CommitOperation } from "../models/History";
import { ARTNode, ARTURIResource, ARTBNode, ARTLiteral, ResourceUtils } from "../models/ARTResources";
import { VBContext } from "../utils/VBContext";

export class CommitDeltaModalData extends BSModalContext {
    constructor(public commit: ARTURIResource) {
        super();
    }
}

@Component({
    selector: "commit-modal",
    templateUrl: "./commitDeltaModal.html",
})
export class CommitDeltaModal implements ModalComponent<CommitDeltaModalData> {
    context: CommitDeltaModalData;


    private additions: CommitOperation[];
    private removals: CommitOperation[];

    constructor(public dialog: DialogRef<CommitDeltaModalData>, private historyService: HistoryServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.historyService.getCommitDelta(this.context.commit).subscribe(
            delta => {
                this.additions = delta.additions;
                this.removals = delta.removals;
            }
        );
    }

    private getShow(res: ARTNode) {
        if (res instanceof ARTBNode) {
            return res.toNT();
        } else if (res instanceof ARTURIResource) {
            let qname: string = ResourceUtils.getQName(res.getURI(), VBContext.getPrefixMappings());
            if (qname != null) {
                return qname;
            } else {
                return res.toNT();
            }
        } else if (res instanceof ARTLiteral) {
            if (res.isTypedLiteral()) {
                let datatypeIRI: string = res.getDatatype();
                let datasetQName: string = ResourceUtils.getQName(datatypeIRI, VBContext.getPrefixMappings());
                if (datasetQName != null) {
                    return "\"" + res.getValue() + "\"^^" + datasetQName;
                } else {
                    return res.toNT();
                }
            } else { //plain
                return res.toNT();
            }
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}