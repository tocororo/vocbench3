import { Component } from "@angular/core";
import { AbstractIcvComponent } from "../abstractIcvComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTURIResource } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "hierarchical-redundancy-component",
    templateUrl: "./hierarchicalRedundancyComponent.html",
    host: { class: "pageComponent" }
})
export class HierarchicalRedundancyComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = false;

    sameScheme: boolean = true;

    brokenRecordList: { subject: ARTURIResource, predicate: ARTURIResource, object: ARTURIResource }[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConceptsHierarchicalRedundancies(this.sameScheme).subscribe(
            redundancies => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = redundancies;
                this.initPaging(this.brokenRecordList);
            }
        );
    }

}