import { Component } from "@angular/core";
import { AbstractIcvComponent } from "../abstractIcvComponent";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ARTResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";
import { AbstractClassPart } from "@angular/compiler/src/output/output_ast";

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