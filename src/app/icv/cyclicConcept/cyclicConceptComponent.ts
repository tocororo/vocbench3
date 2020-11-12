import { Component } from "@angular/core";
import { AbstractIcvComponent } from "../abstractIcvComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTURIResource } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "cyclic-concept-component",
    templateUrl: "./cyclicConceptComponent.html",
    host: { class: "pageComponent" }
})
export class CyclicConceptComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = false;
    brokenRecordList: ARTURIResource[][];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConceptsHierarchicalCycles().subscribe(
            cycles => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = cycles;
                this.initPaging(this.brokenRecordList);
            }
        );
    }

}