import {Component} from "@angular/core";
import {Observable} from 'rxjs/Observable';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource, ARTResource, ARTLiteral, ARTNode, RDFTypesEnum} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";
import {SkosxlServices} from "../../services/skosxlServices";

@Component({
    selector: "only-alt-label-resource-component",
    templateUrl: "app/src/icv/onlyAltLabelResource/onlyAltLabelResourceComponent.html",
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class OnlyAltLabelResourceComponent {
    
    private brokenRecordList: Array<any>; //{resource: ARTURIResource, lang: ARTLiteral}
        //lang is an ARTLiteral just to render it with the rdfResource widget
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
            this.icvService.listResourcesWithOnlySKOSAltLabel().subscribe(
                records => {
                    this.brokenRecordList = records;
                },
                err => { },
                () => document.getElementById("blockDivIcv").style.display = "none"
            )
        } else if (this.ontoType == "SKOS-XL") {
            document.getElementById("blockDivIcv").style.display = "block";
            this.icvService.listResourcesWithOnlySKOSXLAltLabel().subscribe(
                records => {
                    this.brokenRecordList = records;
                },
                err => { },
                () => document.getElementById("blockDivIcv").style.display = "none"
            )
        }
    }
    
    /**
     * Fixes resource by setting the alternative label as preferred
     */
    setAltAsPrefLabel(record) {
        if (this.ontoType == "SKOS") {
            this.skosService.getAltLabels(record.resource, record.lang.getLang()).subscribe(
                altLabels => {
                    this.modalService.selectResource("Select alternative label", null, altLabels).then(
                        selectedAltLabel => {
                            this.changeAltToPref(record.resource, selectedAltLabel).subscribe(
                                () => {
                                    this.runIcv();
                                }
                            );
                        },
                        () => {}
                    );
                }
            );
        } else if (this.ontoType == "SKOS-XL") {
            this.skosxlService.getAltLabels(record.resource, record.lang.getLang()).subscribe(
                altLabels => {
                    this.modalService.selectResource("Select alternative label", null, altLabels).then(
                        selectedAltLabel => {
                            this.changeAltToPref(record.resource, selectedAltLabel).subscribe(
                                () => {
                                    this.runIcv();
                                }
                            );
                        },
                        () => {}
                    );
                }
            );
        }
    }
    
    /**
     * Removes an alt label and set it as pref label. Returns an observable so that
     * in setAltAsPrefLabel it can be subscribed and execute operations once it's done
     */
    private changeAltToPref(resource: ARTURIResource, label: ARTNode) {
        return new Observable(observer => {
            if (this.ontoType == "SKOS") {
                this.skosService.removeAltLabel(resource, (<ARTLiteral>label).getLabel(), (<ARTLiteral>label).getLang()).subscribe(
                    stResp => {
                        this.skosService.setPrefLabel(resource, (<ARTLiteral>label).getLabel(), (<ARTLiteral>label).getLang()).subscribe(
                            stResp => {
                                observer.next();
                                observer.complete();
                            }
                        )
                    }
                );
            } else if (this.ontoType == "SKOS-XL") {
                this.skosxlService.altToPrefLabel(resource, <ARTResource>label).subscribe(
                    stResp => {
                        observer.next();
                        observer.complete();
                    }
                )
            }
        });
    }
    
    /**
     * Fixes resource by adding a preferred label
     */
    addPrefLabel(record) {
        if (this.ontoType == "SKOS") {
            this.modalService.newPlainLiteral("Add skos:prefLabel").then(
                data => {
                    this.skosService.setPrefLabel(record.resource, data.value, data.lang).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    )
                },
                () => {}
            )
        } else if (this.ontoType == "SKOS-XL") {
            this.modalService.newPlainLiteral("Add skosxl:prefLabel").then(
                data => {
                    this.skosxlService.setPrefLabel(record.resource, data.value, data.lang, RDFTypesEnum.uri).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    )
                },
                () => {}
            )
        }
    }
    
}