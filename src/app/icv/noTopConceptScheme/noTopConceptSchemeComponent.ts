import {Component} from "@angular/core";
import {Observable} from 'rxjs/Observable';
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ARTURIResource, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "no-top-concept-scheme-component",
    templateUrl: "./noTopConceptSchemeComponent.html",
    host: { class : "pageComponent" }
})
export class NoTopConceptSchemeComponent {
    
    private brokenSchemeList: Array<ARTURIResource>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private vbCtx: VocbenchCtx,
        private modalService: ModalServices, private browsingService: BrowsingServices) {}
    
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
                document.getElementById("blockDivIcv").style.display = "none";
            },
            err => { document.getElementById("blockDivIcv").style.display = "none"; }
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
                        this.runIcv();
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
        this.modalService.newResource("Create top Concept", this.vbCtx.getContentLanguage()).then(
            data => {
                this.skosService.createTopConcept(data.label, data.lang, scheme, data.name).subscribe(
                    stResp => {
                        this.runIcv();
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
                        this.runIcv();
                    }
                );
            },
            () => {}
        );
    }
    
    /**
     * Fixes schemes by deleting them all 
     */
    deleteAllScheme() {
        this.modalService.confirm("Delete scheme", "Warning, deleting the schemes, if they contain some concepts, " +
                "will generate concepts in no scheme. Are you sure to proceed?").then(
            confirm => {
                var deleteSchemeFnArray = [];
                deleteSchemeFnArray = this.brokenSchemeList.map((sc) => this.skosService.deleteScheme(sc));
                //call the collected functions and subscribe when all are completed
                Observable.forkJoin(deleteSchemeFnArray).subscribe(
                    res => {
                        this.runIcv();
                    }
                );
            },
            () => {}
        );
    }
    
}