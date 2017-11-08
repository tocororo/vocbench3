import { Component } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, RDFResourceRolesEnum, ResAttribute } from "../../models/ARTResources";
import { Language, Languages } from "../../models/LanguagesCountries";
import { SKOS, OWL } from "../../models/Vocabulary";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "no-mandatory-label-component",
    templateUrl: "./noMandatoryLabelComponent.html",
    host: { class: "pageComponent" }
})
export class NoMandatoryLabelComponent {

    private rolesToCheck: RDFResourceRolesEnum[];
    private langsToCheck: string[];

    private brokenRecordList: { resource: ARTResource, langs: Language[] }[];

    constructor(private icvService: IcvServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {}

    private onRolesChanged(roles: RDFResourceRolesEnum[]) {
        this.rolesToCheck = roles;
    }

    private onLangsChanged(langs: string[]) {
        this.langsToCheck = langs;
    }

    /**
     * Run the check
     */
    runIcv() {
        if (this.rolesToCheck.length == 0) {
            this.basicModals.alert("Missing resource type", "You need to select at least a resource type in order to run the ICV", "warning");
            return;
        }
        if (this.langsToCheck.length == 0) {
            this.basicModals.alert("Missing language", "You need to select at least a language in order to run the ICV", "warning");
            return;
        }

        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listResourcesNoLexicalization(this.rolesToCheck, this.langsToCheck).subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let langs: Language[] = Languages.fromTagsToLanguages(r.getAdditionalProperty("missingLang").split(","));
                    this.brokenRecordList.push({ resource: r, langs: langs });
                })
            }
        );
    }

    private onResourceClick(res: ARTResource) {
        this.sharedModals.openResourceView(res, false);
    }

}