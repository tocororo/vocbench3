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
    selector: "overlapped-label-component",
    templateUrl: "./overlappedLabelComponent.html",
    host: { class: "pageComponent" }
})
export class OverlappedLabelComponent {

    private rolesToCheck: RDFResourceRolesEnum[];

    private brokenRecordList: { resources: ARTResource[], label: ARTLiteral|ARTResource }[];

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
        this.icvService.listResourcesWithOverlappedLabels(this.rolesToCheck).subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let xlabelAttr = r.getAdditionalProperty("xlabel");
                    let labelRes: ARTLiteral = Deserializer.createLiteral(r.getAdditionalProperty("label"));
                    //looks for the record with the same label
                    let sameLabelRecord: { resources: ARTResource[], label: ARTLiteral|ARTResource };
                    for (var i = 0; i < this.brokenRecordList.length; i++) {
                        console.log("comparing labels", this.brokenRecordList[i].label.getShow(), labelRes.getShow());
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