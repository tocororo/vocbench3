import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ARTURIResource} from "../../utils/ARTResources";
import {RDFResourceRolesEnum} from "../../utils/Enums";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "no-top-concept-scheme-component",
    templateUrl: "app/src/icv/noTopConceptScheme/noTopConceptSchemeComponent.html",
    providers: [IcvServices, SkosServices, BrowsingServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class NoTopConceptSchemeComponent {
    
    private brokenSchemeList: Array<ARTURIResource>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private vbCtx: VocbenchCtx,
        private modalService: ModalServices, private browsingService: BrowsingServices, private router: Router) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        }
        //navigate to Projects view if a project is not selected
        if (vbCtx.getWorkingProject() == undefined) {
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
                    var s = new ARTURIResource(schemeColl[i].textContent, schemeColl[i].textContent, RDFResourceRolesEnum.conceptScheme); 
                    this.brokenSchemeList.push(s);
                }
            },
            err => { },
            () => document.getElementById("blockDivIcv").style.display = "none"
        );
    }
    
    /**
     * Fixes scheme by selecting a top concept 
     */
    selectTopConcept(scheme: ARTURIResource) {
        this.browsingService.browseConceptTree("Select a top concept", scheme, true).then(
            concept => {
                this.skosService.addTopConcept(concept, scheme).subscribe(
                    stResp => {
                        this.brokenSchemeList.splice(this.brokenSchemeList.indexOf(scheme), 1);
                    }
                );
            },
            () => {}
        );
    }
    
    /**
     * Fixes scheme by creating a top concept 
     */
    createTopConcept(scheme: ARTURIResource) {
        this.modalService.newResource("Create top Concept").then(
            data => {
                this.skosService.createTopConcept(data.name, scheme, data.label, data.lang).subscribe(
                    stResp => {
                        this.brokenSchemeList.splice(this.brokenSchemeList.indexOf(scheme), 1);
                    }
                )
            },
            () => {}
        );
    }
    
    /**
     * Fixes scheme by deleting it 
     */
    deleteScheme(scheme: ARTURIResource) {
        this.modalService.confirm("Delete scheme", "Warning, deleting this scheme, if it contains some concepts, " +
                "will generate concepts in no scheme. Are you sure to proceed?").then(
            result => {
                this.skosService.deleteScheme(scheme).subscribe(
                    stResp => {
                        this.brokenSchemeList.splice(this.brokenSchemeList.indexOf(scheme), 1);
                    },
                    err => { }
                );
            },
            () => {}
        );
    }
    
    /**
     * Fixes schemes by deleting them all 
     */
    deleteAllScheme() {
        alert("Fix not yet available");
        //TODO inform the user with a warning like in deleteScheme
    }
    
}