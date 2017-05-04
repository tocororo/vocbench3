import { Component } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { VBPreferences } from "../../utils/VBPreferences";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";

@Component({
    selector: "dangling-concept-component",
    templateUrl: "./danglingConceptComponent.html",
    host: { class: "pageComponent" }
})
export class DanglingConceptComponent {

    private schemeList: Array<ARTURIResource>;
    private selectedScheme: ARTURIResource;
    private brokenConceptList: Array<ARTURIResource>;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private preferences: VBPreferences,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) { }

    ngOnInit() {
        this.skosService.getAllSchemes().subscribe( //new service
            schemeList => {
                this.schemeList = schemeList;
                var currentScheme = this.preferences.getActiveScheme();
                if (currentScheme != null) {
                    for (var i = 0; i < this.schemeList.length; i++) {
                        if (this.schemeList[i].getURI() == currentScheme.getURI()) {
                            this.selectedScheme = this.schemeList[i];
                            break;
                        }
                    }
                }
            }
        );
    }

    /**
     * Run the check
     */
    private runIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listDanglingConcepts(this.selectedScheme).subscribe(
            stResp => {
                this.brokenConceptList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    var dc = new ARTURIResource(recordColl[i].getAttribute("concept"), recordColl[i].getAttribute("concept"), RDFResourceRolesEnum.concept);
                    this.brokenConceptList.push(dc);
                }
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"))
            },
            err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv")); }
        );
    }

    /**
     * Fixes concept by setting the concept as topConceptOf the current scheme 
     */
    private setAsTopConcept(concept: ARTURIResource) {
        this.skosService.addTopConcept(concept, this.selectedScheme).subscribe(
            data => {
                this.runIcv();
            }
        );
    }

    /**
     * Fixes all concepts by setting them all as topConceptOf the current scheme
     */
    private setAllTopConcept() {
        this.icvService.setAllDanglingAsTopConcept(this.selectedScheme).subscribe(
            stResp => {
                this.runIcv();
            }
        )
    }

    /**
     * Fixes concept by selecting a broader concept
     */
    private selectBroader(concept: ARTURIResource) {
        this.browsingModals.browseConceptTree("Select a skos:broader", this.selectedScheme, true).then(
            (broader: any) => {
                this.skosService.addBroaderConcept(concept, broader).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                )
            },
            () => { }
        );
    }

    /**
     * Fixes all concepts by selecting a broader concept for them all 
     */
    private selectBroaderForAll() {
        this.browsingModals.browseConceptTree("Select a skos:broader", this.selectedScheme, false).then(
            (broader: any) => {
                this.icvService.setBroaderForAllDangling(this.selectedScheme, broader).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                )
            },
            () => { }
        );
    }

    /**
     * Fixes concept by removing the concept from the current scheme 
     */
    private removeFromScheme(concept: ARTURIResource) {
        this.basicModals.confirm("Remove from scheme", "Warning, if this concept has narrowers, removing the " +
            "dangling concept from the scheme may generate other dangling concepts. Are you sure to proceed?").then(
            result => {
                this.skosService.removeConceptFromScheme(concept, this.selectedScheme).subscribe(
                    data => {
                        this.runIcv();
                    }
                );
            },
            () => { }
            );
    }

    /**
     * Fixes concepts by removing them all from the current scheme 
     */
    private removeAllFromScheme() {
        this.basicModals.confirm("Remove from scheme", "Warning, if the concepts have narrowers, removing them " +
            "may generate other dangling concepts. Are you sure to proceed?").then(
            result => {
                this.icvService.removeAllDanglingFromScheme(this.selectedScheme).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            },
            () => { }
            );
    }

    /**
     * Fixes concept by deleting it 
     */
    private deleteConcept(concept: ARTURIResource) {
        this.skosService.deleteConcept(concept).subscribe(
            stResp => {
                this.runIcv();
            }
        )
    }

    /**
     * Fixes dangling simply by deleting them all
     */
    private deleteAll(concept: ARTURIResource) {
        this.icvService.deleteAllDanglingConcepts(this.selectedScheme).subscribe(
            stResp => {
                this.runIcv();
            }
        )
    }

}