import { Component } from "@angular/core";
import { ARTLiteral, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { Deserializer } from "../../utils/Deserializer";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractIcvComponent } from "../abstractIcvComponent";

@Component({
    selector: "extra-space-label-component",
    templateUrl: "./extraSpaceLabelComponent.html",
    host: { class: "pageComponent" }
})
export class ExtraSpaceLabelComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = true;
    brokenRecordList: { resource: ARTResource, label: ARTLiteral|ARTResource }[];

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