import { Component } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractIcvComponent } from "../abstractIcvComponent";

@Component({
    selector: "disjoint-exact-match-component",
    templateUrl: "./disjointExactMatchConceptComponent.html",
    host: { class: "pageComponent" }
})
export class DisjointExactMatchConceptComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = false;
    brokenRecordList: ARTResource[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConceptsExactMatchDisjoint().subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = resources;

                this.initPaging(this.brokenRecordList);
            }
        );
    
    }

}