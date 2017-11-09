import { Component } from "@angular/core";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "disjoint-related-component",
    templateUrl: "./disjointRelatedConceptComponent.html",
    host: { class: "pageComponent" }
})
export class DisjointRelatedConceptComponent {

    private brokenRecordList: ARTResource[];

    constructor(private icvService: IcvServices, private sharedModals: SharedModalServices) { }

    /**
     * Run the check
     */
    runIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConceptsRelatedDisjoint().subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = resources;
            }
        );
    
    }

    private onResourceClick(res: ARTResource) {
        this.sharedModals.openResourceView(res, false);
    }

}