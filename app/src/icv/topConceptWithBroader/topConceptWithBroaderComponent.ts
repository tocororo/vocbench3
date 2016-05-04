import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {RDFResourceRolesEnum} from "../../utils/Enums";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "top-concept-with-broader-component",
    templateUrl: "app/src/icv/topConceptWithBroader/topConceptWithBroaderComponent.html",
    providers: [IcvServices, SkosServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class TopConceptWithBroaderComponent {
    
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
        this.icvService.listTopConceptsWithBroader().subscribe(
            stResp => {
                this.brokenRecordList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    var c = new ARTURIResource(recordColl[i].getAttribute("concept"), recordColl[i].getAttribute("concept"), RDFResourceRolesEnum.concept);
                    var s = new ARTURIResource(recordColl[i].getAttribute("scheme"), recordColl[i].getAttribute("scheme"), RDFResourceRolesEnum.conceptScheme); 
                    this.brokenRecordList.push({concept: c, scheme: s});
                }
            },
            err => { },
            () => document.getElementById("blockDivIcv").style.display = "none"
        );
    }
    
    /**
     * Fixes concept by ...
     * How to fix a topConcept with broader(s)?
     * Currently in ST the "fix" button just open the resource view to let the user fix the problem. I don't like it.
     * The idea is to remove the skos:broader relations with concept in the same skos:ConceptScheme,
     * namely remove triples like
     * topConcept - skos:broader - broader
     * To fix the problem, the client send to server the concept-scheme pair and 
     * the server perform a query to fetch all the broaders of concept in scheme
     * and then remove the skos:broader relations
     */
    fix(record) {
        alert("Fix not yet available");
        var concept = record.concept;
        var scheme = record.scheme;
        //TODO fix to be determined
    }
    
    /**
     * Fixes all concept by ... 
     * The idea is to do something like fix() but instead of sending the desired concept-scheme pair
     * (with the concept to fix), the server do a new query to get all the topConcept with broader and remove
     * the skos:broader relations
     */
    quickFix() {
        alert("Quick fix not yet available");
        for (var i = 0; i < this.brokenRecordList.length; i++) {
            var concept = this.brokenRecordList[i].concept;
            var scheme = this.brokenRecordList[i].scheme;
            //TODO fix to be determined
        }
    }
    
}