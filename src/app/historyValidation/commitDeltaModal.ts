import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { HistoryServices } from "../services/historyServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { CommitOperation } from "../models/History";
import { ARTNode, ARTResource, ARTURIResource, ARTBNode, ARTLiteral, ResourceUtils } from "../models/ARTResources";
import { VBContext } from "../utils/VBContext";
import { UIUtils } from "../utils/UIUtils";

export class CommitDeltaModalData extends BSModalContext {
    constructor(public commit: ARTURIResource) {
        super();
    }
}

@Component({
    selector: "commit-modal",
    templateUrl: "./commitDeltaModal.html"
})
export class CommitDeltaModal implements ModalComponent<CommitDeltaModalData> {
    context: CommitDeltaModalData;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;


    private additions: CommitOperation[];
    private removals: CommitOperation[];
    private truncated: boolean = false; //true if response contains
    private messageTruncated: string;

    constructor(public dialog: DialogRef<CommitDeltaModalData>, private historyService: HistoryServices, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.historyService.getCommitDelta(this.context.commit).subscribe(
            delta => {
                this.additions = delta.additions;
                this.removals = delta.removals;
                let additionsTruncated: number = delta.additionsTruncated;
                let removalsTruncated: number = delta.removalsTruncated;
                if (additionsTruncated || removalsTruncated) {
                    this.truncated = true;
                    if (additionsTruncated) {
                        this.messageTruncated = "For performance issue, the additions reported have been limited to " + additionsTruncated + " triples";
                        if (removalsTruncated) {
                            this.messageTruncated += " as well as the removals";
                        }
                    } else {
                        this.messageTruncated = "For performance issue, the removals reported have been limited to " + removalsTruncated + " triples";
                    }
                }
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
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



    private openResource(resource: ARTNode) {
        if (resource.isResource()) {
            this.sharedModals.openResourceView(<ARTResource>resource, true);
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}