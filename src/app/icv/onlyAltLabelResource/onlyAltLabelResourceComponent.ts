import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, ARTResource, ARTLiteral, ARTNode, RDFTypesEnum } from "../../models/ARTResources";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";

@Component({
    selector: "only-alt-label-resource-component",
    templateUrl: "./onlyAltLabelResourceComponent.html",
    host: { class: "pageComponent" }
})
export class OnlyAltLabelResourceComponent {

    private brokenRecordList: Array<any>; //{resource: ARTURIResource, lang: ARTLiteral}
    //lang is an ARTLiteral just to render it with the rdfResource widget
    private ontoType: string;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private basicModals: BasicModalServices, private creationModals: CreationModalServices) { }

    ngOnInit() {
        this.ontoType = VBContext.getWorkingProject().getPrettyPrintOntoType();
    }

    /**
     * Run the check
     */
    runIcv() {
        if (this.ontoType == "SKOS") {
            UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
            this.icvService.listResourcesWithOnlySKOSAltLabel().subscribe(
                records => {
                    this.brokenRecordList = records;
                },
                err => { },
                () => UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"))
            )
        } else if (this.ontoType == "SKOS-XL") {
            UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
            this.icvService.listResourcesWithOnlySKOSXLAltLabel().subscribe(
                records => {
                    this.brokenRecordList = records;
                },
                err => { },
                () => UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"))
            )
        }
    }

    /**
     * Fixes resource by setting the alternative label as preferred
     */
    setAltAsPrefLabel(record: any) {
        if (this.ontoType == "SKOS") {
            this.skosService.getAltLabels(record.resource, record.lang.getLang()).subscribe(
                altLabels => {
                    this.basicModals.selectResource("Select alternative label", null, altLabels).then(
                        (selectedAltLabel: any) => {
                            this.changeAltToPref(record.resource, selectedAltLabel).subscribe(
                                () => {
                                    this.runIcv();
                                }
                            );
                        },
                        () => { }
                    );
                }
            );
        } else if (this.ontoType == "SKOS-XL") {
            this.skosxlService.getAltLabels(record.resource, record.lang.getLang()).subscribe(
                altLabels => {
                    this.basicModals.selectResource("Select alternative label", null, altLabels).then(
                        (selectedAltLabel: any) => {
                            this.changeAltToPref(record.resource, selectedAltLabel).subscribe(
                                () => {
                                    this.runIcv();
                                }
                            );
                        },
                        () => { }
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
        return new Observable((observer: any) => {
            if (this.ontoType == "SKOS") {
                this.skosService.removeAltLabel(resource, <ARTLiteral>label).subscribe(
                    stResp => {
                        this.skosService.setPrefLabel(resource, (<ARTLiteral>label)).subscribe(
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
    addPrefLabel(record: any) {
        if (this.ontoType == "SKOS") {
            this.creationModals.newPlainLiteral("Add skos:prefLabel").then(
                (literal: any) => {
                    this.skosService.setPrefLabel(record.resource, literal).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    )
                },
                () => { }
            )
        } else if (this.ontoType == "SKOS-XL") {
            this.creationModals.newPlainLiteral("Add skosxl:prefLabel").then(
                (literal: any) => {
                    this.skosxlService.setPrefLabel(record.resource, (<ARTLiteral>literal), RDFTypesEnum.uri).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    )
                },
                () => { }
            )
        }
    }

}