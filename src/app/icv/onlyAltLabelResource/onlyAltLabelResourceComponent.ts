import { Component } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";
import { Language, Languages } from "../../models/LanguagesCountries";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractIcvComponent } from "../abstractIcvComponent";

@Component({
    selector: "only-alt-label-resource-component",
    templateUrl: "./onlyAltLabelResourceComponent.html",
    host: { class: "pageComponent" }
})
export class OnlyAltLabelResourceComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = true;
    brokenRecordList: { resource: ARTResource, langs: Language[] }[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listResourcesWithAltNoPrefLabel(this.rolesToCheck).subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let langs: Language[] = Languages.fromTagsToLanguages(r.getAdditionalProperty("missingLang").split(","));
                    this.brokenRecordList.push({ resource: r, langs: langs });
                });
                this.initPaging(this.brokenRecordList);
            }
        );
    }

}