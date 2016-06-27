import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ARTURIResource, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "dangling-concept-component",
    templateUrl: "app/src/icv/danglingConcept/danglingConceptComponent.html",
    providers: [IcvServices, SkosServices, BrowsingServices],
    directives: [RdfResourceComponent, ROUTER_DIRECTIVES],
    host: { class : "pageComponent" }
})
export class DanglingConceptComponent {
    
    private schemeList: Array<ARTURIResource>;
    private selectedScheme: ARTURIResource;
    private brokenConceptList: Array<ARTURIResource>;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private vbCtx: VocbenchCtx, 
        private modalService: ModalServices, private browsingService: BrowsingServices) {}
    
    ngOnInit() {
        this.skosService.getAllSchemesList().subscribe(
            schemeList => {
                this.schemeList = schemeList;
                var currentScheme = this.vbCtx.getScheme();
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
        document.getElementById("blockDivIcv").style.display = "block";
        this.icvService.listDanglingConcepts(this.selectedScheme).subscribe(
            stResp => {
                this.brokenConceptList = new Array();
                var recordColl = stResp.getElementsByTagName("record");
                for (var i = 0; i < recordColl.length; i++) {
                    var dc = new ARTURIResource(recordColl[i].getAttribute("concept"), recordColl[i].getAttribute("concept"), RDFResourceRolesEnum.concept);
                    this.brokenConceptList.push(dc);
                }
                document.getElementById("blockDivIcv").style.display = "none"
            },
            err => { document.getElementById("blockDivIcv").style.display = "none"; }
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
        this.browsingService.browseConceptTree("Select a skos:broader", this.selectedScheme, true).then(
            broader => {
                this.skosService.addBroaderConcept(concept, broader).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                )
            },
            () => {}
        );
    }
    
    /**
     * Fixes all concepts by selecting a broader concept for them all 
     */
    private selectBroaderForAll() {
        this.browsingService.browseConceptTree("Select a skos:broader", this.selectedScheme, false).then(
            broader => {
                this.icvService.setBroaderForAllDangling(this.selectedScheme, broader).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                )
            },
            () => {}
        );
    }
    
    /**
     * Fixes concept by removing the concept from the current scheme 
     */
    private removeFromScheme(concept: ARTURIResource) {
        this.modalService.confirm("Remove from scheme", "Warning, if this concept has narrowers, removing the " +
                "dangling concept from the scheme may generate other dangling concepts. Are you sure to proceed?").then(
            result => {
                this.skosService.removeConceptFromScheme(concept, this.selectedScheme).subscribe(
                    data => {
                        this.runIcv();
                    }
                );
            },
            () => {}
        );
    }
    
    /**
     * Fixes concepts by removing them all from the current scheme 
     */
    private removeAllFromScheme() {
        this.modalService.confirm("Remove from scheme", "Warning, if the concepts have narrowers, removing them " +
                "may generate other dangling concepts. Are you sure to proceed?").then(
            result => {
                this.icvService.removeAllDanglingFromScheme(this.selectedScheme).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            },
            () => {}
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