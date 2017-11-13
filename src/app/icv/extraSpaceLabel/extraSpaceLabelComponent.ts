import { Component } from "@angular/core";
import { AbstractIcvComponent } from "../abstractIcvComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, ARTURIResource, ARTNode, RDFResourceRolesEnum, ARTLiteral, ResAttribute } from "../../models/ARTResources";
import { UIUtils } from "../../utils/UIUtils";
import { Deserializer } from "../../utils/Deserializer";
import { IcvServices } from "../../services/icvServices";
import { literal } from "@angular/compiler/src/output/output_ast";

@Component({
    selector: "extra-space-label-component",
    templateUrl: "./extraSpaceLabelComponent.html",
    host: { class: "pageComponent" }
})
export class ExtraSpaceLabelComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = true;
    private brokenRecordList: { resource: ARTResource, label: ARTLiteral|ARTResource }[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listResourcesWithExtraSpacesInLabel(this.rolesToCheck).subscribe(
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

                this.initPaging(this.brokenRecordList);
            }
        );
    
    }

}