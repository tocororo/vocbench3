import { Component } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, ARTURIResource, ARTNode, RDFResourceRolesEnum, ARTLiteral } from "../../models/ARTResources";
import { XmlSchema } from "../../models/Vocabulary";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";
import { isRegExp } from "util";

@Component({
    selector: "no-lang-label-component",
    templateUrl: "./noLangLabelComponent.html",
    host: { class: "pageComponent" }
})
export class NoLangLabelComponent {

    private rolesToCheck: RDFResourceRolesEnum[];

    private brokenRecordList: { resource: ARTResource, label: ARTLiteral|ARTResource }[];

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
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let xlabelAttr = r.getAdditionalProperty("xlabel");
                    let labelAttr = r.getAdditionalProperty("label");
                    if (xlabelAttr != null) {
                        this.brokenRecordList.push({
                            resource: r, 
                            label: new ARTURIResource(xlabelAttr, labelAttr, RDFResourceRolesEnum.xLabel)
                        });
                    } else {
                        this.brokenRecordList.push({
                            resource: r, 
                            label: new ARTLiteral(labelAttr, XmlSchema.string.getURI())
                        });
                    }
                });
            }
        );
    
    }

    private isResource(res: ARTNode) {
        return res.isResource();
    }

    private onResourceClick(res: ARTResource) {
        if (this.isResource(res)) {
            this.sharedModals.openResourceView(res, false);
        }
    }

}