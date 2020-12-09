import { Component } from "@angular/core";
import { ARTLiteral, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { SKOS, SKOSXL } from "../../models/Vocabulary";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { VBContext } from "../../utils/VBContext";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { NewXLabelModalReturnData } from "../../widget/modal/creationModal/newResourceModal/skos/newXLabelModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "no-label-resource-component",
    templateUrl: "./noLabelResourceComponent.html",
    host: { class: "pageComponent" }
})
export class NoLabelResourceComponent {

    brokenResourceList: Array<ARTResource>;
    private lexicalizationModel: string;
    title: string;
    private actionLabel: string;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private creationModals: CreationModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.lexicalizationModel = VBContext.getWorkingProject().getLexicalizationModelType();
        if (this.lexicalizationModel == SKOS.uri) {
            this.title = "ICV.LABEL.NO_SKOS_PREFLABEL.NAME";
            this.actionLabel = "ICV.LABEL.NO_SKOS_PREFLABEL.ADD_PREFLABEL";
        } else if (this.lexicalizationModel == SKOSXL.uri) {
            this.title = "ICV.LABEL.NO_SKOSXL_PREFLABEL.NAME";
            this.actionLabel = "ICV.LABEL.NO_SKOSXL_PREFLABEL.ADD_PREFLABEL";
        }
    }

    /**
     * Run the check
     */
    runIcv() {
        if (this.lexicalizationModel == SKOS.uri) {
            this.icvService.listResourcesWithNoSKOSPrefLabel().subscribe(
                brokenRes => {
                    this.brokenResourceList = brokenRes;
                }
            );
        } else if (this.lexicalizationModel == SKOSXL.uri) {
            this.icvService.listResourcesWithNoSKOSXLPrefLabel().subscribe(
                brokenRes => {
                    this.brokenResourceList = brokenRes;
                }
            );
        }
    }

    /**
     * Fixes resource by setting a label 
     */
    fix(resource: ARTURIResource) {
        if (this.lexicalizationModel == SKOS.uri) {
            this.creationModals.newPlainLiteral("Add skos:prefLabel").then(
                (literal: ARTLiteral[]) => {
                    this.skosService.setPrefLabel(resource, literal[0]).subscribe(
                        () => {
                            this.runIcv();
                        }
                    )
                },
                () => { }
            );
        } else if (this.lexicalizationModel == SKOSXL.uri) {
            this.creationModals.newXLabel("Add skosxl:prefLabel").then(
                (data: NewXLabelModalReturnData) => {
                    this.skosxlService.setPrefLabel(resource, data.labels[0], data.cls).subscribe(
                        () => {
                            this.runIcv();
                        }
                    )
                },
                () => { }
            );
        }
    }

    onResourceClick(res: ARTResource) {
        this.sharedModals.openResourceView(res, false);
    }

}