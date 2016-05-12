import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {RDFResourceRolesEnum} from "../../utils/Enums";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
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
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, 
            private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }
    
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
                this.brokenRecordList.splice(this.brokenRecordList.indexOf(record), 1);
            }
        );
    }
    
    /**
     * Fixes all record by removing redundant relations (server side with just one request)
     */
    quickFix() {
        //TODO needs a service that retrieve againg every redundant relations and remove them
        //(c3 broader c2, c2 broader c1, c3 broader c1, x3 broader x2, x2 broader x1, x3 broader x1,
        //removes c3 broader c1 and x3 broader x1)
        alert("Quick fix not yet available");
    }
    
}