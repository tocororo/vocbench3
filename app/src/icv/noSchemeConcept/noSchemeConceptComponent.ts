import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "no-scheme-concept-component",
    templateUrl: "app/src/icv/noSchemeConcept/noSchemeConceptComponent.html",
    providers: [IcvServices, SkosServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class NoSchemeConceptComponent {
    
    private brokenConceptList: Array<ARTURIResource>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, 
            private vbCtx: VocbenchCtx, private router: Router) {
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
        this.icvService.listConceptsWithNoScheme().subscribe(
            stResp => {
                this.brokenConceptList = new Array();
                var conceptColl = stResp.getElementsByTagName("concept");
                for (var i = 0; i < conceptColl.length; i++) {
                    var c = new ARTURIResource(conceptColl[i].textContent, conceptColl[i].textContent, "concept"); 
                    this.brokenConceptList.push(c);       
                }
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            },
            () => document.getElementById("blockDivIcv").style.display = "none");
    }
    
    /**
     * Fixes concept by adding it to a scheme 
     */
    addToScheme(concept: ARTURIResource) {
        alert("Fix not yet available");
        //TODO here open a modal to select a scheme
        // this.skosService.addConceptToScheme(concept, this.vbCtx.getScheme()).subscribe(
        //     data => {
        //         //remove the concept from the list
        //         this.brokenConceptList.splice(this.brokenConceptList.indexOf(concept), 1);
        //     },
        //     err => {
        //         alert("Error: " + err);
        //         console.error(err['stack']);
        //     }
        // );
    }
    
    /**
     * Fixes concepts by adding them all to a scheme
     */
    addAllToScheme() {
        //TODO this fix requires a new service server side that takes a list of concept and adds them to a scheme
        alert("Fix not yet available");
        //TODO here open a modal to select a scheme
    }
    
    /**
     * Fixes concept by deleting it 
     */
    deleteConcept(concept: ARTURIResource) {
        this.skosService.deleteConcept(concept).subscribe(
            stResp => {
                //remove the concept from the list
                this.brokenConceptList.splice(this.brokenConceptList.indexOf(concept), 1);
            }
        );
    }
    
    /**
     * Fixes concepts by deleting them all 
     */
    deleteAllConcept() {
        alert("Fix not yet available");
        //TODO this fix requires a new service server side that takes a list of concept and delete them all
    }
    
}