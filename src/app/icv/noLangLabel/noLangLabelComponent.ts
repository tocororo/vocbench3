import { Component } from "@angular/core";
import { ARTLiteral, ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { XmlSchema } from "../../models/Vocabulary";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractIcvComponent } from "../abstractIcvComponent";

@Component({
    selector: "no-lang-label-component",
    templateUrl: "./noLangLabelComponent.html",
    host: { class: "pageComponent" }
})
export class NoLangLabelComponent extends AbstractIcvComponent {

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

                this.initPaging(this.brokenRecordList);
            }
        );
    
    }

}