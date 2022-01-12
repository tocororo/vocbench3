import { Component } from "@angular/core";
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { ARTResource, ARTURIResource } from "../../models/ARTResources";
import { SKOSXL } from "../../models/Vocabulary";
import { ClassesServices } from "../../services/classesServices";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "dangling-label-component",
    templateUrl: "./danglingXLabelComponent.html",
    host: { class: "pageComponent" }
})
export class DanglingXLabelComponent {

    brokenLabelList: Array<ARTResource>;

    constructor(private icvService: IcvServices, private classesService: ClassesServices,
        private browsingModals: BrowsingModalServices, private sharedModals: SharedModalServices) { }

    /**
     * Run the check
     */
    runIcv() {
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
        this.sharedModals.selectResource({key:"DATA.ACTIONS.SELECT_LEXICALIZATION_PROPERTY"}, null, predOpts).then(
            (selectedPred: ARTURIResource[]) => {
                let activeSchemes: ARTURIResource[] = VBContext.getWorkingProjectCtx().getProjectPreferences().activeSchemes;
                this.browsingModals.browseConceptTree({key:"DATA.ACTIONS.SELECT_CONCEPT"}, activeSchemes, true).then(
                    (concept: any) => {
                        var xlabelPred: ARTURIResource;
                        this.icvService.setDanglingXLabel(concept, selectedPred[0], xlabel).subscribe(
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