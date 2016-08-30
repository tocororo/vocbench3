import {Component} from "@angular/core";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource, ARTResource, ARTLiteral} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";
import {SkosxlServices} from "../../services/skosxlServices";

@Component({
    selector: "overlapped-label-component",
    templateUrl: "app/src/icv/overlappedLabel/overlappedLabelComponent.html",
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class OverlappedLabelComponent {
    
    private brokenRecordList: Array<any>; //{resource: ARTURIResource, label: ARTLiteral}
    private ontoType: string;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private vbCtx: VocbenchCtx, private modalService: ModalServices) {}
    
    ngOnInit() {
        this.ontoType = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }
    
    /**
     * Run the check
     */
    runIcv() {
        if (this.ontoType == "SKOS") {
            document.getElementById("blockDivIcv").style.display = "block";
            this.icvService.listResourcesWithOverlappedSKOSLabel().subscribe(
                brokenRecords => {
                    this.brokenRecordList = brokenRecords;
                    document.getElementById("blockDivIcv").style.display = "none";
                },
                err => { document.getElementById("blockDivIcv").style.display = "none"; }
            );
        } else if (this.ontoType == "SKOS-XL") {
            document.getElementById("blockDivIcv").style.display = "block";
            this.icvService.listResourcesWithOverlappedSKOSXLLabel().subscribe(
                brokenRecords => {
                    this.brokenRecordList = brokenRecords;
                    document.getElementById("blockDivIcv").style.display = "none";
                },
                err => { document.getElementById("blockDivIcv").style.display = "none"; }
            );
        }
    }
    
    /**
     * Fixes by changing prefLabel
     */
    changePrefLabel(record) {
        this.modalService.newPlainLiteral("Change preferred label", (<ARTLiteral>record.label).getLabel(), false,
            (<ARTLiteral>record.label).getLang(), true).then(
            data => {
                var label = data.value;
                var lang = data.lang;
                if (this.ontoType == "SKOS") {
                    this.skosService.removePrefLabel(record.resource, (<ARTLiteral>record.label).getLabel(), lang).subscribe(
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
            () => {}
        )
    }
    
    /**
     * Fixes by removing prefLabel
     */
    removePrefLabel(record) {
        if (this.ontoType == "SKOS") {
            this.skosService.removePrefLabel(record.resource, (<ARTLiteral>record.label).getLabel(), (<ARTLiteral>record.label).getLang()).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        } else { //SKOS-XL
            this.skosxlService.removePrefLabel(record.resource, (<ARTLiteral>record.label).getLabel(), (<ARTLiteral>record.label).getLang()).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        }
    }
    
    /**
     * Fixes by changing altLabel
     */
    changeAltLabel(record) {
        this.modalService.newPlainLiteral("Change preferred label", (<ARTLiteral>record.label).getLabel(), false,
            (<ARTLiteral>record.label).getLang(), true).then(
            data => {
                var label = data.value;
                var lang = data.lang;
                if (this.ontoType == "SKOS") {
                    this.skosService.removeAltLabel(record.resource, (<ARTLiteral>record.label).getLabel(), (<ARTLiteral>record.label).getLang()).subscribe(
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
                                if (altLabels[i].getShow() == (<ARTLiteral>record.label).getLabel()) {
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
            () => {}
        );
    }
    
    /**
     * Fixes by removing altLabel
     */
    removeAltLabel(record) {
        if (this.ontoType == "SKOS") {
            this.skosService.removeAltLabel(record.resource, (<ARTLiteral>record.label).getLabel(), (<ARTLiteral>record.label).getLang()).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        } else { //SKOS-XL
            this.skosxlService.removeAltLabel(record.resource, (<ARTLiteral>record.label).getLabel(), (<ARTLiteral>record.label).getLang()).subscribe(
                stReso => {
                    this.runIcv();
                }
            );
        }
    }
    
}