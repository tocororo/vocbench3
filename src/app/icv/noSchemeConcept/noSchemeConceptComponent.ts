import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "no-scheme-concept-component",
    templateUrl: "./noSchemeConceptComponent.html",
    host: { class: "pageComponent" }
})
export class NoSchemeConceptComponent {

    private brokenConceptList: Array<ARTURIResource>;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private browsingModals: BrowsingModalServices) { }

    /**
     * Run the check
     */
    runIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConceptsWithNoScheme().subscribe(
            stResp => {
                this.brokenConceptList = new Array();
                var conceptColl = stResp.getElementsByTagName("concept");
                for (var i = 0; i < conceptColl.length; i++) {
                    var c = new ARTURIResource(conceptColl[i].textContent, conceptColl[i].textContent, RDFResourceRolesEnum.concept);
                    this.brokenConceptList.push(c);
                }
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
            },
            err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv")); }
        );
    }

    /**
     * Fixes concept by adding it to a scheme 
     */
    addToScheme(concept: ARTURIResource) {
        this.browsingModals.browseSchemeList("Select a scheme").then(
            (scheme: any) => {
                this.skosService.addConceptToScheme(concept, scheme).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                )
            },
            () => { }
        )
    }

    /**
     * Fixes concepts by adding them all to a scheme
     */
    addAllToScheme() {
        this.browsingModals.browseSchemeList("Select a scheme").then(
            (scheme: any) => {
                this.icvService.addAllConceptsToScheme(scheme).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                )
            },
            () => { }
        )
    }

    /**
     * Fixes concept by deleting it 
     */
    deleteConcept(concept: ARTURIResource) {
        this.skosService.deleteConcept(concept).subscribe(
            stResp => {
                this.runIcv();
            }
        );
    }

    /**
     * Fixes concepts by deleting them all 
     */
    deleteAllConcept() {
        var deleteConcFnArray: any[] = [];
        deleteConcFnArray = this.brokenConceptList.map((conc) => this.skosService.deleteConcept(conc));
        //call the collected functions and subscribe when all are completed
        Observable.forkJoin(deleteConcFnArray).subscribe(
            res => {
                this.runIcv();
            }
        );
    }

}