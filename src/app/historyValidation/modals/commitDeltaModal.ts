import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTBNode, ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { CommitInfo, CommitOperation } from "../../models/History";
import { HistoryServices } from "../../services/historyServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "commit-modal",
    templateUrl: "./commitDeltaModal.html"
})
export class CommitDeltaModal {
    @Input() commit: CommitInfo;

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;


    additions: CommitOperation[];
    removals: CommitOperation[];
    truncated: boolean = false; //true if response contains
    private messageTruncated: string;

    constructor(public activeModal: NgbActiveModal, private historyService: HistoryServices, private sharedModals: SharedModalServices) {
    }

    ngOnInit() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.historyService.getCommitDelta(this.commit.commit).subscribe(
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
                let datatypeQName: string = ResourceUtils.getQName(datatypeIRI, VBContext.getPrefixMappings());
                if (datatypeQName != datatypeIRI) {
                    return "\"" + res.getValue() + "\"^^" + datatypeQName;
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

    ok() {
        this.activeModal.close();
    }

}