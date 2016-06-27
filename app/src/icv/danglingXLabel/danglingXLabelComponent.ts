import {Component} from "@angular/core";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTResource, ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {SKOSXL} from "../../utils/Vocabulary";
import {IcvServices} from "../../services/icvServices";
import {SkosxlServices} from "../../services/skosxlServices";
import {DeleteServices} from "../../services/deleteServices";

@Component({
    selector: "dangling-label-component",
    templateUrl: "app/src/icv/danglingXLabel/danglingXLabelComponent.html",
    providers: [IcvServices, SkosxlServices, DeleteServices, BrowsingServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class DanglingXLabelComponent {
    
    private brokenLabelList: Array<ARTResource>;
    
    constructor(private icvService: IcvServices, private skosxlService: SkosxlServices, private deleteService: DeleteServices,
        private browsingService: BrowsingServices, private modalService: ModalServices, private vbCtx: VocbenchCtx) {}
    
    /**
     * Run the check
     */
    private runIcv() {
        document.getElementById("blockDivIcv").style.display = "block";
        this.icvService.listDanglingXLabels().subscribe(
            labels => {
                this.brokenLabelList = labels;
                document.getElementById("blockDivIcv").style.display = "none"
            },
            err => { document.getElementById("blockDivIcv").style.display = "none"; }
        );
    }

    /**
     * Deletes the given xlabel
     */
    deleteLabel(xlabel: ARTResource) {
        this.deleteService.removeInstance(xlabel, SKOSXL.label).subscribe(
            stResp => {
                this.runIcv();
            }
        )
    }

    /**
     * Ask the user to choose the relation whith which link the xlabel, then ask for the concept to which
     * set the dangling xlabel.
     */
    assignLabel(xlabel: ARTResource) {
        //as pref alt or hidden?
        var predOpts = [SKOSXL.prefLabel, SKOSXL.altLabel, SKOSXL.hiddenLabel];
        this.modalService.selectResource("Set skosxl:Label as", null, predOpts).then(
            selectedPred => {
                this.browsingService.browseConceptTree("Assign xLabel to concept", this.vbCtx.getScheme(), true).then(
                    concept => {
                        var xlabelPred: ARTURIResource;
                        this.icvService.setDanglingXLabel(concept, selectedPred, xlabel).subscribe(
                            stResp => {
                                this.runIcv();
                            }
                        )
                    },
                    () => {}
                )
            },
            () => {}
        )
    }
    
    /**
     * Quick fix. Deletes all dangling xLabel.
     */
    deleteAllLabel() {
        this.icvService.deleteAllDanglingXLabel().subscribe(
            stResp => {
                this.runIcv();
            }
        )
    }

}