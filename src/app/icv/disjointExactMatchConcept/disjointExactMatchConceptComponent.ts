import { Component } from "@angular/core";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "disjoint-exact-match-component",
    templateUrl: "./disjointExactMatchConceptComponent.html",
    host: { class: "pageComponent" }
})
export class DisjointExactMatchConceptComponent {


    private brokenRecordList: ARTResource[];

    constructor(private icvService: IcvServices, private sharedModals: SharedModalServices) { }

    /**
     * Run the check
     */
    runIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConceptsExactMatchDisjoint().subscribe(
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