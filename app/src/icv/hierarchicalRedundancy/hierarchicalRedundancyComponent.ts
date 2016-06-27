import {Component} from "@angular/core";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ARTURIResource, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "hierarchical-redundancy-component",
    templateUrl: "app/src/icv/hierarchicalRedundancy/hierarchicalRedundancyComponent.html",
    providers: [IcvServices, SkosServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class HierarchicalRedundancyComponent {
    
    private brokenRecordList: Array<any>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices) {}
    
    /**
     * Run the check
     */
    runIcv() {
        //TODO check when service will be refactored
        document.getElementById("blockDivIcv").style.display = "block";
        this.icvService.listHierarchicallyRedundantConcepts().subscribe(
            stResp => {
                this.brokenRecordList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    var b = new ARTURIResource(recordColl[i].getAttribute("broader"), recordColl[i].getAttribute("broader"), RDFResourceRolesEnum.concept);
                    var n = new ARTURIResource(recordColl[i].getAttribute("narrower"), recordColl[i].getAttribute("narrower"), RDFResourceRolesEnum.concept); 
                    this.brokenRecordList.push({broader: b, narrower: n});
                }
                document.getElementById("blockDivIcv").style.display = "none";
            },
            err => { document.getElementById("blockDivIcv").style.display = "none"; }
        );
    }
    
    /**
     * Fixes redundancies by removing the redundant relation between broader and narrower
     */
    fix(record) {
        var broader = record.broader;
        var narrower = record.narrower;
        this.skosService.removeBroaderConcept(narrower, broader).subscribe(
            stResp => {
                this.runIcv();
            }
        );
    }
    
    /**
     * Fixes all record by removing redundant relations (server side with just one request)
     */
    quickFix() {
        this.icvService.removeAllHierarchicalRedundancy().subscribe(
            stResp => {
                this.runIcv();
            }
        )
    }
    
}