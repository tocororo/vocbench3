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
    private danglingConceptList: Array<ARTURIResource>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, 
            private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
        
        this.scheme = vbCtx.getScheme();
    }
    
    /**
     * Run the check and lists the dangling concepts
     */
    runIcv() {
        //TODO when listDanglingConcepts will be refactored provide also scheme as parameter
        document.getElementById("blockDivIcv").style.display = "block";
        this.icvService.listDanglingConcepts().subscribe(
            stResp => {
                //TODO when the service will be refactored, revise this code
                this.danglingConceptList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    //check needed untill listDanglingConcepts will be refactored
                    if (recordColl[i].getAttribute("scheme") == this.scheme.getURI()) {
                        var dc = new ARTURIResource(recordColl[i].getAttribute("concept"), recordColl[i].getAttribute("concept"), "concept"); 
                        this.danglingConceptList.push(dc);       
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
     * Fixes dangling concept by setting the concept as topConceptOf the current scheme, then update the danglingConceptList 
     */
    setAsTopConcept(concept: ARTURIResource) {
        this.skosService.addTopConcept(concept, this.scheme).subscribe(
            data => {
                //remove the concept from the danglingConceptList
                for (var i = 0; i < this.danglingConceptList.length; i++) {
                    if (this.danglingConceptList[i].getURI() == concept.getURI()) {
                        this.danglingConceptList.splice(i, 1);
                    }
                }
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            });
    }
    
    /**
     * Fixes dangling concept by selecting a broader concept
     */
    selectBroader(concept: ARTURIResource) {
        alert("Selecting broader for " + concept.getURI() + " (fix not yet available, opening concept tree for scheme "
            + this.scheme.getURI() + "...)");
        //TODO here I should open a modal to show the concept tree and select a concept
    }
    
    /**
     * Fixes dangling concept by removing the concept from the current scheme, then update the danglingConceptList 
     */
    removeFromScheme(concept: ARTURIResource) {
        this.skosService.removeConceptFromScheme(concept, this.scheme).subscribe(
            data => {
                //remove the concept from the danglingConceptList
                for (var i = 0; i < this.danglingConceptList.length; i++) {
                    if (this.danglingConceptList[i].getURI() == concept.getURI()) {
                        this.danglingConceptList.splice(i, 1);
                    }
                }
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            });
    }
    
    /**
     * Fixes all dangling concepts by setting them all as topConceptOf the current scheme
     */
    setAllTopConcept() {
        //TODO this fix requires a new service server side that takes a list of concept and sets them as topConcept of a scheme
        alert("Setting all concept as topConceptOf " + this.scheme.getURI() + " (quick fix not yet available)");
    }
    
    /**
     * Fixes all dangling concepts by selecting a broader concept for them all 
     */
    selectBroaderForAll() {
        //TODO this fix requires a new service server side that takes a list of concept and sets for them a broader concept
        alert("Selecting a broader for all concept (quick fix not yet available, opening concept tree for scheme "
            + this.scheme.getURI() + "...)");
        //TODO here I should open a modal to show the concept tree and select a concept
    }
    
    /**
     * Fixes all dangling concepts by removing them all from the current scheme 
     */
    removeAllFromScheme() {
        //TODO this fix requires a new service server side that takes a list of concept removes them from a scheme
        alert("Removing all concept from " + this.scheme.getURI() + " (quick fix not yet available)");
    }
    
}