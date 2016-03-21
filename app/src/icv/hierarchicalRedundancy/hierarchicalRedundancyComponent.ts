import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
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
            private vbCtx: VocbenchCtx, private modalService: ModalServices, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
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
            },
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err['stack']);
            },
            () => document.getElementById("blockDivIcv").style.display = "none"
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
            },
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err['stack']);
            }
        );
    }
    
    /**
     * Fixes all record by removing redundant relations (server side with just one request)
     */
    quickFix() {
        alert("Quick fix not yet available");
    }
    
}