import { Component } from "@angular/core";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ARTResource, ARTURIResource } from "../../models/ARTResources";
import { SKOSXL } from "../../models/Vocabulary";
import { VBPreferences } from "../../utils/VBPreferences";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { ClassesServices } from "../../services/classesServices";

@Component({
    selector: "dangling-label-component",
    templateUrl: "./danglingXLabelComponent.html",
    host: { class: "pageComponent" }
})
export class DanglingXLabelComponent {

    private brokenLabelList: Array<ARTResource>;

    constructor(private icvService: IcvServices, private skosxlService: SkosxlServices, private classesService: ClassesServices,
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices, private preferences: VBPreferences) { }

    /**
     * Run the check
     */
    private runIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listDanglingXLabels().subscribe(
            labels => {
                this.brokenLabelList = labels;
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"))
            },
            err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv")); }
        );
    }

    /**
     * Deletes the given xlabel
     */
    deleteLabel(xlabel: ARTResource) {
        this.classesService.deleteInstance(xlabel, SKOSXL.label).subscribe(
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
        this.basicModals.selectResource("Set skosxl:Label as", null, predOpts).then(
            (selectedPred: any) => {
                this.browsingModals.browseConceptTree("Assign xLabel to concept", this.preferences.getActiveSchemes(), true).then(
                    (concept: any) => {
                        var xlabelPred: ARTURIResource;
                        this.icvService.setDanglingXLabel(concept, selectedPred, xlabel).subscribe(
                            stResp => {
                                this.runIcv();
                            }
                        )
                    },
                    () => { }
                )
            },
            () => { }
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