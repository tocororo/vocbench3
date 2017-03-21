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

    private brokenRecordList: Array<any>;

    constructor(private icvService: IcvServices, private skosService: SkosServices) { }

    /**
     * Run the check
     */
    runIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listTopConceptsWithBroader().subscribe(
            stResp => {
                this.brokenRecordList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    var c = new ARTURIResource(recordColl[i].getAttribute("concept"), recordColl[i].getAttribute("concept"), RDFResourceRolesEnum.concept);
                    var s = new ARTURIResource(recordColl[i].getAttribute("scheme"), recordColl[i].getAttribute("scheme"), RDFResourceRolesEnum.conceptScheme);
                    this.brokenRecordList.push({ concept: c, scheme: s });
                }
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
            },
            err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv")); }
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