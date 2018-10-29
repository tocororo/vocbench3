import { Component } from "@angular/core";
import { AbstractIcvComponent } from "../abstractIcvComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, ARTURIResource, ARTNode, RDFResourceRolesEnum, ARTLiteral, ResAttribute } from "../../models/ARTResources";
import { XmlSchema } from "../../models/Vocabulary";
import { UIUtils } from "../../utils/UIUtils";
import { Deserializer } from "../../utils/Deserializer";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "conflictual-label-component",
    templateUrl: "./conflictualLabelComponent.html",
    host: { class: "pageComponent" }
})
export class ConflictualLabelComponent extends AbstractIcvComponent {

    checkLanguages = false;
    checkRoles = true;
    private brokenRecordList: { resources: ARTResource[], label: ARTLiteral|ARTResource }[];

    constructor(private icvService: IcvServices, basicModals: BasicModalServices, sharedModals: SharedModalServices) {
        super(basicModals, sharedModals);
    }

    /**
     * Run the check
     */
    executeIcv() {
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listResourcesWithSameLabels(this.rolesToCheck).subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let xlabelAttr = r.getAdditionalProperty("xlabel");
                    let labelRes: ARTLiteral = Deserializer.createLiteral(r.getAdditionalProperty("label"));
                    //looks for the record with the same label
                    let sameLabelRecord: { resources: ARTResource[], label: ARTLiteral|ARTResource };
                    for (var i = 0; i < this.brokenRecordList.length; i++) {
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