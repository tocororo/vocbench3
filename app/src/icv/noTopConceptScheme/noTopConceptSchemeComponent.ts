import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "no-top-concept-scheme-component",
    templateUrl: "app/src/icv/noTopConceptScheme/noTopConceptSchemeComponent.html",
    providers: [IcvServices, SkosServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class NoTopConceptSchemeComponent {
    
    private brokenSchemeList: Array<ARTURIResource>;
    
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
        this.icvService.listConceptSchemesWithNoTopConcept().subscribe(
            stResp => {
                this.brokenSchemeList = new Array();
                var schemeColl = stResp.getElementsByTagName("conceptScheme");
                for (var i = 0; i < schemeColl.length; i++) {
                    var s = new ARTURIResource(schemeColl[i].textContent, schemeColl[i].textContent, "conceptScheme"); 
                    this.brokenSchemeList.push(s);
                }
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            },
            () => document.getElementById("blockDivIcv").style.display = "none"
        );
    }
    
    /**
     * Fixes scheme by selecting a top concept 
     */
    selectTopConcept(scheme: ARTURIResource) {
        alert("Fix not yet available");
        //TODO here open a modal with a list of concept in the given scheme to select a top concept
    }
    
    /**
     * Fixes scheme by creating a top concept 
     */
    createTopConcept(scheme: ARTURIResource) {
        var conceptName = prompt("Insert concept name");
        if (conceptName == null) return;
        this.skosService.createTopConcept(conceptName, scheme, null, null).subscribe(
            data => {
                this.brokenSchemeList.splice(this.brokenSchemeList.indexOf(scheme), 1);
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            }
        );
    }
    
    /**
     * Fixes scheme by deleting it 
     */
    deleteScheme(scheme: ARTURIResource) {
        if (confirm("Warning, deleting this scheme, if it contains some scheme, will generate concept in no scheme. Are you sure to proceed?")) {
            this.skosService.deleteScheme(scheme).subscribe(
                stResp => {
                    this.brokenSchemeList.splice(this.brokenSchemeList.indexOf(scheme), 1);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err['stack']);
                }
            );
        }
    }
    
    /**
     * Fixes schemes by deleting them all 
     */
    deleteAllScheme() {
        alert("Fix not yet available");
        //TODO inform the user with a warning like in deleteScheme
    }
    
}