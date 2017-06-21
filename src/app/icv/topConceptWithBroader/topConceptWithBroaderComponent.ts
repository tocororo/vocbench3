import { Component } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";

@Component({
    selector: "top-concept-with-broader-component",
    templateUrl: "./topConceptWithBroaderComponent.html",
    host: { class: "pageComponent" }
})
export class TopConceptWithBroaderComponent {

    private brokenRecordList: {concept: ARTURIResource, scheme: ARTURIResource}[];

    constructor(private icvService: IcvServices, private skosService: SkosServices) { }

    /**
     * Run the check
     */
    runIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listTopConceptsWithBroader().subscribe(
            records => {
                this.brokenRecordList = records;
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
            }
        );
    }

    removeBroaders(record: any) {
        var concept = record.concept;
        var scheme = record.scheme;
        this.icvService.removeBroadersToConcept(concept, scheme).subscribe(
            stResp => {
                this.runIcv();
            }
        );
    }

    removeAsTopConceptOf(record: any) {
        var concept = record.concept;
        var scheme = record.scheme;
        this.skosService.removeTopConcept(concept, scheme).subscribe(
            stResp => {
                this.runIcv();
            }
        );
    }

    removeBroadersToAll() {
        this.icvService.removeBroadersToAllConcepts().subscribe(
            stResp => {
                this.runIcv();
            }
        );
    }

    removeAllAsTopConceptOf() {
        this.icvService.removeAllAsTopConceptsWithBroader().subscribe(
            stResp => {
                this.runIcv();
            }
        );
    }

}