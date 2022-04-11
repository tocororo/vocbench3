import { Component } from "@angular/core";
import { ARTLiteral, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { Deserializer } from "../../utils/Deserializer";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { AbstractIcvComponent } from "../abstractIcvComponent";

@Component({
    selector: "overlapped-label-component",
    templateUrl: "./overlappedLabelComponent.html",
    host: { class: "pageComponent" }
})
export class OverlappedLabelComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = true;
    brokenRecordList: { resources: ARTResource[], label: ARTLiteral|ARTResource }[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listResourcesWithOverlappedLabels(this.rolesToCheck).subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let xlabelAttr = r.getAdditionalProperty("xlabel");
                    let labelRes: ARTLiteral = Deserializer.createLiteral(r.getAdditionalProperty("label"));
                    //looks for the record with the same label
                    let sameLabelRecord: { resources: ARTResource[], label: ARTLiteral|ARTResource };
                    for (let i = 0; i < this.brokenRecordList.length; i++) {
                        if (this.brokenRecordList[i].label.getShow() == labelRes.getShow()) {
                            sameLabelRecord = this.brokenRecordList[i];
                            break;
                        }
                    }
                    //record found => add the resource to the resources of the record
                    if (sameLabelRecord != null) {
                        sameLabelRecord.resources.push(r);
                    } else { //record not found => create it
                        //distinguishes skos and skosxl
                        if (xlabelAttr != null) {
                            let xLabel: ARTURIResource = new ARTURIResource(xlabelAttr, labelRes.getShow(), RDFResourceRolesEnum.xLabel);
                            xLabel.setAdditionalProperty(ResAttribute.LANG, labelRes.getLang());
                            this.brokenRecordList.push({
                                resources: [r], 
                                label: xLabel
                            });
                        } else {
                            this.brokenRecordList.push({
                                resources: [r], 
                                label: labelRes
                            });
                        }
                    }
                });
                this.initPaging(this.brokenRecordList);
            }
        );
    
    }

}