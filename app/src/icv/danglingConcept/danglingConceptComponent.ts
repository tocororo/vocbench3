import {Component} from "angular2/core";
import {Router, RouterLink} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "dangling-concept-component",
    templateUrl: "app/src/icv/danglingConcept/danglingConceptComponent.html",
    providers: [IcvServices, SkosServices],
    directives: [RdfResourceComponent, RouterLink],
    host: { class : "pageComponent" }
})
export class DanglingConceptComponent {
    
    private scheme: ARTURIResource;
    private brokenConceptList: Array<ARTURIResource>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, 
            private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
        
        this.scheme = vbCtx.getScheme();
    }
    
    /**
     * Run the check
     */
    runIcv() {
        //TODO check when service will be refactored
        document.getElementById("blockDivIcv").style.display = "block";
        this.icvService.listDanglingConcepts().subscribe(
            stResp => {
                this.brokenConceptList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    if (recordColl[i].getAttribute("scheme") == this.scheme.getURI()) {
                        var dc = new ARTURIResource(recordColl[i].getAttribute("concept"), recordColl[i].getAttribute("concept"), "concept"); 
                        this.brokenConceptList.push(dc);       
                    }
                }
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            },
            () => document.getElementById("blockDivIcv").style.display = "none");
    }
    
    /**
     * Fixes concept by setting the concept as topConceptOf the current scheme 
     */
    setAsTopConcept(concept: ARTURIResource) {
        this.skosService.addTopConcept(concept, this.scheme).subscribe(
            data => {
                //remove the concept from the danglingConceptList
                for (var i = 0; i < this.brokenConceptList.length; i++) {
                    if (this.brokenConceptList[i].getURI() == concept.getURI()) {
                        this.brokenConceptList.splice(i, 1);
                        break;
                    }
                }
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            });
    }
    
    /**
     * Fixes all concepts by setting them all as topConceptOf the current scheme
     */
    setAllTopConcept() {
        //TODO this fix requires a new service server side that takes a list of concept and sets them as topConcept of a scheme
        alert("Fix not yet available");
    }
    
    /**
     * Fixes concept by selecting a broader concept
     */
    selectBroader(concept: ARTURIResource) {
        alert("Fix not yet available");
        //TODO here I should open a modal to show the concept tree and select a concept
    }
    
    /**
     * Fixes all concepts by selecting a broader concept for them all 
     */
    selectBroaderForAll() {
        //TODO this fix requires a new service server side that takes a list of concept and sets for them a broader concept
        alert("Fix not yet available");
        //TODO here I should open a modal to show the concept tree and select a concept
    }
    
    /**
     * Fixes concept by removing the concept from the current scheme 
     */
    removeFromScheme(concept: ARTURIResource) {
        if (confirm("Warning, if this concept has narrowers, removing the dangling concept from the scheme " +
                "may generate other dangling concepts. Are you sure to proceed?")) {
            this.skosService.removeConceptFromScheme(concept, this.scheme).subscribe(
                data => {
                    //remove the concept from the danglingConceptList
                    for (var i = 0; i < this.brokenConceptList.length; i++) {
                        if (this.brokenConceptList[i].getURI() == concept.getURI()) {
                            this.brokenConceptList.splice(i, 1);
                            break;
                        }
                    }
                },
                err => {
                    alert("Error: " + err);
                    console.error(err['stack']);
                }
            );
        }
    }
    
    /**
     * Fixes concepts by removing them all from the current scheme 
     */
    removeAllFromScheme() {
        //TODO this fix requires a new service server side that takes a list of concept removes them from a scheme
        alert("Fix not yet available");
    }
    
}