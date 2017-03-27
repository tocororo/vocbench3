import { Component } from "@angular/core";
import { ModalServices } from "../../widget/modal/modalServices";
import { ARTURIResource, ARTResource, ARTLiteral } from "../../models/ARTResources";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";

@Component({
    selector: "overlapped-label-component",
    templateUrl: "./overlappedLabelComponent.html",
    host: { class: "pageComponent" }
})
export class OverlappedLabelComponent {

    private brokenRecordList: Array<any>; //{resource: ARTURIResource, label: ARTLiteral}
    private ontoType: string;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private modalService: ModalServices) { }

    ngOnInit() {
        this.ontoType = VBContext.getWorkingProject().getPrettyPrintOntoType();
    }

    /**
     * Run the check
     */
    runIcv() {
        if (this.ontoType == "SKOS") {
            UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
            this.icvService.listResourcesWithOverlappedSKOSLabel().subscribe(
                brokenRecords => {
                    this.brokenRecordList = brokenRecords;
                    UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                },
                err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv")); }
            );
        } else if (this.ontoType == "SKOS-XL") {
            UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
            this.icvService.listResourcesWithOverlappedSKOSXLLabel().subscribe(
                brokenRecords => {
                    this.brokenRecordList = brokenRecords;
                    UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                },
                err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv")); }
            );
        }
    }

    /**
     * Fixes by changing prefLabel
     */
    changePrefLabel(record: any) {
        this.modalService.newPlainLiteral("Change preferred label", (<ARTLiteral>record.label).getValue(), false,
            (<ARTLiteral>record.label).getLang(), true).then(
            (data: any) => {
                var label = data.value;
                var lang = data.lang;
                if (this.ontoType == "SKOS") {
                    this.skosService.removePrefLabel(record.resource, (<ARTLiteral>record.label).getValue(), lang).subscribe(
                        stResp => {
                            this.skosService.setPrefLabel(record.resource, label, lang).subscribe(
                                stResp => {
                                    this.runIcv();
                                }
                            )
                        }
                    )
                } else { //SKOS-XL
                    //first get the xlabel to change
                    this.skosxlService.getPrefLabel(record.resource, lang).subscribe(
                        xlabel => {
                            //then update info
                            this.skosxlService.changeLabelInfo(xlabel, label, lang).subscribe(
                                stResp => {
                                    this.runIcv();
                                }
                            )
                        }
                    );
                }
            },
            () => { }
            )
    }

    /**
     * Fixes by removing prefLabel
     */
    removePrefLabel(record: any) {
        if (this.ontoType == "SKOS") {
            this.skosService.removePrefLabel(record.resource, (<ARTLiteral>record.label).getValue(), (<ARTLiteral>record.label).getLang()).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        } else { //SKOS-XL
            this.skosxlService.removePrefLabel(record.resource, (<ARTLiteral>record.label).getValue(), (<ARTLiteral>record.label).getLang()).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        }
    }

    /**
     * Fixes by changing altLabel
     */
    changeAltLabel(record: any) {
        this.modalService.newPlainLiteral("Change preferred label", (<ARTLiteral>record.label).getValue(), false,
            (<ARTLiteral>record.label).getLang(), true).then(
            (data: any) => {
                var label = data.value;
                var lang = data.lang;
                if (this.ontoType == "SKOS") {
                    this.skosService.removeAltLabel(record.resource, (<ARTLiteral>record.label).getValue(), (<ARTLiteral>record.label).getLang()).subscribe(
                        stReso => {
                            this.skosService.addAltLabel(record.resource, label, lang).subscribe(
                                stResp => {
                                    this.runIcv();
                                }
                            );
                        }
                    );
                } else { //SKOS-XL
                    //first get the xlabel to change
                    this.skosxlService.getAltLabels(record.resource, lang).subscribe(
                        altLabels => {
                            //look for the alt label URI
                            for (var i = 0; i < altLabels.length; i++) {
                                if (altLabels[i].getShow() == (<ARTLiteral>record.label).getValue()) {
                                    //then update info
                                    this.skosxlService.changeLabelInfo(<ARTResource>altLabels[i], label, lang).subscribe(
                                        stResp => {
                                            this.runIcv();
                                        }
                                    )
                                }
                            }
                        }
                    );
                }
            },
            () => { }
            );
    }

    /**
     * Fixes by removing altLabel
     */
    removeAltLabel(record: any) {
        if (this.ontoType == "SKOS") {
            this.skosService.removeAltLabel(record.resource, (<ARTLiteral>record.label).getValue(), (<ARTLiteral>record.label).getLang()).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        } else { //SKOS-XL
            this.skosxlService.removeAltLabel(record.resource, (<ARTLiteral>record.label).getValue(), (<ARTLiteral>record.label).getLang()).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        }
    }

}