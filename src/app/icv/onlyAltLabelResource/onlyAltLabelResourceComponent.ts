import { Component } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { Language, Languages } from "../../models/LanguagesCountries";
import { ARTResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { SKOS, OWL } from "../../models/Vocabulary";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "only-alt-label-resource-component",
    templateUrl: "./onlyAltLabelResourceComponent.html",
    host: { class: "pageComponent" }
})
export class OnlyAltLabelResourceComponent {

    private rolesToCheck: RDFResourceRolesEnum[];

    private brokenRecordList: { resource: ARTResource, langs: Language[] }[];

    constructor(private icvService: IcvServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {}

    private onRolesChanged(roles: RDFResourceRolesEnum[]) {
        this.rolesToCheck = roles;
    }

    /**
     * Run the check
     */
    runIcv() {
        if (this.rolesToCheck.length == 0) {
            this.basicModals.alert("Missing resource type", "You need to select at least a resource type in order to run the ICV", "warning");
            return;
        }

        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listResourcesWithAltNoPrefLabel(this.rolesToCheck).subscribe(
            resources => {
                console.log("resources");
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