import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ARTURIResource, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "no-scheme-concept-component",
    templateUrl: "app/src/icv/noSchemeConcept/noSchemeConceptComponent.html",
    providers: [IcvServices, SkosServices, BrowsingServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class NoSchemeConceptComponent {
    
    private brokenConceptList: Array<ARTURIResource>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private browsingService: BrowsingServices,
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
        document.getElementById("blockDivIcv").style.display = "block";
        this.icvService.listConceptsWithNoScheme().subscribe(
            stResp => {
                this.brokenConceptList = new Array();
                var conceptColl = stResp.getElementsByTagName("concept");
                for (var i = 0; i < conceptColl.length; i++) {
                    var c = new ARTURIResource(conceptColl[i].textContent, conceptColl[i].textContent, RDFResourceRolesEnum.concept); 
                    this.brokenConceptList.push(c);       
                }
                document.getElementById("blockDivIcv").style.display = "none";
            },
            err => { document.getElementById("blockDivIcv").style.display = "none"; }
        );
    }
    
    /**
     * Fixes concept by adding it to a scheme 
     */
    addToScheme(concept: ARTURIResource) {
        this.browsingService.browseSchemeList("Select a scheme").then(
            scheme => {
                this.skosService.addConceptToScheme(concept, scheme).subscribe(
                    stResp => {
                        //remove the concept from the list
                        this.brokenConceptList.splice(this.brokenConceptList.indexOf(concept), 1);
                    }
                )
            },
            () => {}
        )
    }
    
    /**
     * Fixes concepts by adding them all to a scheme
     */
    addAllToScheme() {
        this.browsingService.browseSchemeList("Select a scheme").then(
            scheme => {
                this.icvService.addAllConceptsToScheme(scheme).subscribe(
                    stResp => this.brokenConceptList = []
                )
            },
            () => {}
        )
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
       
        //TODO this fix causes CuncurrentModificationException. Disabled untill it is fixed server side.
        // var deleteConcFnArray = [];
        // deleteConcFnArray = this.brokenConceptList.map((conc) => this.skosService.deleteConcept(conc));
        // //call the collected functions and subscribe when all are completed
        // Observable.forkJoin(deleteConcFnArray).subscribe(
        //     res => this.brokenConceptList = []
        // );
    }
    
}