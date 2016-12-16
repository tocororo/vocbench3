import {Component} from "@angular/core";
import {ARTURIResource, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "top-concept-with-broader-component",
    templateUrl: "./topConceptWithBroaderComponent.html",
    host: { class : "pageComponent" }
})
export class TopConceptWithBroaderComponent {
    
    private brokenRecordList: Array<any>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices) {}
    
    /**
     * Run the check
     */
    runIcv() {
        document.getElementById("blockDivIcv").style.display = "block";
        this.icvService.listTopConceptsWithBroader().subscribe(
            stResp => {
                this.brokenRecordList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    var c = new ARTURIResource(recordColl[i].getAttribute("concept"), recordColl[i].getAttribute("concept"), RDFResourceRolesEnum.concept);
                    var s = new ARTURIResource(recordColl[i].getAttribute("scheme"), recordColl[i].getAttribute("scheme"), RDFResourceRolesEnum.conceptScheme); 
                    this.brokenRecordList.push({concept: c, scheme: s});
                }
                document.getElementById("blockDivIcv").style.display = "none";
            },
            err => { document.getElementById("blockDivIcv").style.display = "none"; }
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