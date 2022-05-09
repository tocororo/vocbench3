import { Component } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { ResourceUtils, SortAttribute } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "dangling-concept-component",
    templateUrl: "./danglingConceptComponent.html",
    host: { class: "pageComponent" }
})
export class DanglingConceptComponent {

    schemeList: Array<ARTURIResource>;
    selectedScheme: ARTURIResource = null;
    brokenConceptList: Array<ARTURIResource>;
    brokenConceptMap: BrokenConceptEntry[];

    constructor(private icvService: IcvServices, private skosService: SkosServices,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.skosService.getAllSchemes().subscribe(
            schemeList => {
                this.schemeList = schemeList;
                ResourceUtils.sortResources(this.schemeList, SortAttribute.show);
            }
        );
    }

    /**
     * Run the check
     */
    runIcv() {
        this.brokenConceptList = null;
        this.brokenConceptMap = null;
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        if (this.selectedScheme == null) {
            this.icvService.listDanglingConceptsForAllSchemes().subscribe(
                concepts => {
                    this.brokenConceptMap = [];
                    ResourceUtils.sortResources(concepts, SortAttribute.show); //in this way the concepts will be added to the map according show order
                    concepts.forEach(c => {
                        let schemeIRI: string = c.getAdditionalProperty("dangScheme");
                        let scheme: ARTURIResource = this.schemeList.find(s => s.getURI() == schemeIRI);
                        if (scheme == null) {
                            scheme = new ARTURIResource(schemeIRI, null, RDFResourceRolesEnum.conceptScheme);
                        }
                        let brokenConceptOfScheme: BrokenConceptEntry = this.brokenConceptMap.find(e => e.scheme.equals(scheme));
                        if (brokenConceptOfScheme == null) {
                            brokenConceptOfScheme = { scheme: scheme, concepts: [c] };
                            this.brokenConceptMap.push(brokenConceptOfScheme);
                        } else {
                            brokenConceptOfScheme.concepts.push(c);
                        }
                    });
                    //sort also the schemes
                    this.brokenConceptMap.sort(((e1: BrokenConceptEntry, e2: BrokenConceptEntry) => {
                        return e1.scheme.getShow().localeCompare(e2.scheme.getShow());
                    }));
                    UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                }
            );
        } else {
            this.icvService.listDanglingConcepts(this.selectedScheme).subscribe(
                concepts => {
                    ResourceUtils.sortResources(concepts, SortAttribute.show);
                    this.brokenConceptList = concepts;
                    UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                }
            );
        }

    }

    /**
     * Fixes concept by setting the concept as topConceptOf the current scheme 
     */
    private setAsTopConcept(concept: ARTURIResource, scheme: ARTURIResource) {
        this.skosService.addTopConcept(concept, scheme).subscribe(
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
        );
    }

    /**
     * Fixes concept by selecting a broader concept
     */
    private selectBroader(concept: ARTURIResource, scheme: ARTURIResource) {
        this.browsingModals.browseConceptTree({ key: "DATA.ACTIONS.SELECT_CONCEPT" }, [scheme], true).then(
            (broader: any) => {
                this.skosService.addBroaderConcept(concept, broader).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Fixes all concepts by selecting a broader concept for them all 
     */
    private selectBroaderForAll() {
        this.browsingModals.browseConceptTree({ key: "DATA.ACTIONS.SELECT_CONCEPT" }, [this.selectedScheme], false).then(
            (broader: any) => {
                this.icvService.setBroaderForAllDangling(this.selectedScheme, broader).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Fixes concept by removing the concept from the current scheme 
     */
    private removeFromScheme(concept: ARTURIResource, scheme: ARTURIResource) {
        this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.REMOVE_DANGLING_FROM_SCHEME_WARN_CONFIRM" }).then(
            result => {
                this.skosService.removeConceptFromScheme(concept, scheme).subscribe(
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
        this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.REMOVE_DANGLINGS_FROM_SCHEME_WARN_CONFIRM" }).then(
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
        );
    }

    /**
     * Fixes dangling simply by deleting them all
     */
    private deleteAll(concept: ARTURIResource) {
        this.icvService.deleteAllDanglingConcepts(this.selectedScheme).subscribe(
            stResp => {
                this.runIcv();
            }
        );
    }

    private onResourceClick(res: ARTURIResource) {
        this.sharedModals.openResourceView(res, false);
    }

}


class BrokenConceptEntry {
    scheme: ARTURIResource;
    concepts: ARTURIResource[];
}