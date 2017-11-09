import { Component } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "no-lang-label-component",
    templateUrl: "./noLangLabelComponent.html",
    host: { class: "pageComponent" }
})
export class NoLangLabelComponent {

    private rolesToCheck: RDFResourceRolesEnum[];

    private brokenRecordList: ARTResource[];

    constructor(private icvService: IcvServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) { }

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
        this.icvService.listResourcesWithNoLanguageTagForLabel(this.rolesToCheck).subscribe(
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