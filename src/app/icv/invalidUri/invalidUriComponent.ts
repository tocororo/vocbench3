import { Component } from "@angular/core";
import { AbstractIcvComponent } from "../abstractIcvComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTURIResource } from "../../models/ARTResources";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "invalid-uri-component",
    templateUrl: "./invalidUriComponent.html",
    host: { class: "pageComponent" }
})
export class InvalidUriComponent extends AbstractIcvComponent {

    checkRoles: boolean = false;
    checkLanguages: boolean = false;

    brokenRecordList: ARTURIResource[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listLocalInvalidURIs().subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = resources;
                this.initPaging(this.brokenRecordList);
            }
        );
    }

}