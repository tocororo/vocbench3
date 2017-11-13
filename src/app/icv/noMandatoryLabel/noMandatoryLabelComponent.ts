import { Component } from "@angular/core";
import { AbstractIcvComponent } from "../abstractIcvComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { Language, Languages } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "no-mandatory-label-component",
    templateUrl: "./noMandatoryLabelComponent.html",
    host: { class: "pageComponent" }
})
export class NoMandatoryLabelComponent extends AbstractIcvComponent {

    checkLanguages = true;
    checkRoles = true;
    private brokenRecordList: { resource: ARTResource, langs: Language[] }[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listResourcesNoLexicalization(this.rolesToCheck, this.langsToCheck).subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let langs: Language[] = Languages.fromTagsToLanguages(r.getAdditionalProperty("missingLang").split(","));
                    this.brokenRecordList.push({ resource: r, langs: langs });
                })
                this.initPaging(this.brokenRecordList);
            }
        );
    }


}