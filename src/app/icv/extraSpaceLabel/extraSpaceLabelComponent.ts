import { Component } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, ARTURIResource, ARTNode, RDFResourceRolesEnum, ARTLiteral, ResAttribute } from "../../models/ARTResources";
import { XmlSchema } from "../../models/Vocabulary";
import { UIUtils } from "../../utils/UIUtils";
import { Deserializer } from "../../utils/Deserializer";
import { IcvServices } from "../../services/icvServices";
import { literal } from "@angular/compiler/src/output/output_ast";

@Component({
    selector: "extra-space-label-component",
    templateUrl: "./extraSpaceLabelComponent.html",
    host: { class: "pageComponent" }
})
export class ExtraSpaceLabelComponent {

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
        this.icvService.listResourcesWitExtraSpacesInLabel(this.rolesToCheck).subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let xlabelAttr = r.getAdditionalProperty("xlabel");
                    let labelRes: ARTLiteral = Deserializer.createLiteral(r.getAdditionalProperty("label"));
                    if (xlabelAttr != null) {
                        let xLabel: ARTURIResource = new ARTURIResource(xlabelAttr, labelRes.getShow(), RDFResourceRolesEnum.xLabel);
                        xLabel.setAdditionalProperty(ResAttribute.LANG, labelRes.getLang());
                        this.brokenRecordList.push({
                            resource: r, 
                            label: xLabel
                        });
                    } else {
                        this.brokenRecordList.push({
                            resource: r, 
                            label: labelRes
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