import { Component } from "@angular/core";
import { ARTResource, ARTURIResource } from "../../models/ARTResources";
import { SKOSXL } from "../../models/Vocabulary";
import { ClassesServices } from "../../services/classesServices";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "dangling-label-component",
    templateUrl: "./danglingXLabelComponent.html",
    host: { class: "pageComponent" }
})
export class DanglingXLabelComponent {

    private brokenLabelList: Array<ARTResource>;

    constructor(private icvService: IcvServices, private classesService: ClassesServices,
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices) { }

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
                let activeSchemes: ARTURIResource[] = VBContext.getWorkingProjectCtx().getProjectPreferences().activeSchemes;
                this.browsingModals.browseConceptTree("Assign xLabel to concept", activeSchemes, true).then(
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