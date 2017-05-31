import { Component } from "@angular/core";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, ARTResource, ARTLiteral, ResAttribute } from "../../models/ARTResources";
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

    private brokenRecordList: Array<any>; //if SKOS {resource: ARTURIResource, label: ARTLiteral}
            //if SKOSXL {resource: ARTURIResource, prefLabel: ARTResource, altLabel: ARTResource}
    private ontoType: string;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private creationModals: CreationModalServices) { }

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
                }
            );
        }
    }

    /**
     * Fixes by changing prefLabel
     */
    changePrefLabel(record: any) {
        this.creationModals.newPlainLiteral("Change preferred label", (<ARTLiteral>record.label).getValue(), false,
            (<ARTLiteral>record.label).getLang(), true).then(
            (literal: any) => {
                if (this.ontoType == "SKOS") {
                    this.skosService.removePrefLabel(record.resource, record.label).subscribe(
                        stResp => {
                            this.skosService.setPrefLabel(record.resource, literal).subscribe(
                                stResp => {
                                    this.runIcv();
                                }
                            )
                        }
                    )
                } else { //SKOS-XL
                    //first get the xlabel to change
                    this.skosxlService.getPrefLabel(record.resource, (<ARTLiteral>literal).getLang()).subscribe(
                        xlabel => {
                            //then update info
                            this.skosxlService.changeLabelInfo(xlabel, (<ARTLiteral>literal)).subscribe(
                                stResp => {
                                    this.runIcv();
                                }
                            )
                        }
                    );
                }
            },
            () => { }
        );
    }

    /**
     * Fixes by removing prefLabel
     */
    removePrefLabel(record: any) {
        if (this.ontoType == "SKOS") {
            this.skosService.removePrefLabel(record.resource, record.label).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        } else { //SKOS-XL
            this.skosxlService.removePrefLabel(record.resource, (<ARTResource>record.prefLabel)).subscribe(
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
        var literalForm: string;
        var lang: string;
        if (this.ontoType == "SKOS") {
            literalForm = (<ARTLiteral>record.label).getValue();
            lang = (<ARTLiteral>record.label).getLang();
        } else {
            literalForm = (<ARTResource>record.altLabel).getShow();
            lang = (<ARTResource>record.altLabel).getAdditionalProperty(ResAttribute.LANG);
        }
        this.creationModals.newPlainLiteral("Change preferred label", literalForm, false, lang, true).then(
            (literal: any) => {
                if (this.ontoType == "SKOS") {
                    this.skosService.removeAltLabel(record.resource, <ARTLiteral>record.label).subscribe(
                        stReso => {
                            this.skosService.addAltLabel(record.resource, literal).subscribe(
                                stResp => {
                                    this.runIcv();
                                }
                            );
                        }
                    );
                } else { //SKOS-XL
                    this.skosxlService.changeLabelInfo((<ARTResource>record.altLabel), (<ARTLiteral>literal)).subscribe(
                        stResp => {
                            this.runIcv();
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
            this.skosService.removeAltLabel(record.resource, <ARTLiteral>record.label).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        } else { //SKOS-XL
            this.skosxlService.removeAltLabel(record.resource, (<ARTResource>record.altLabel)).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        }
    }

}