import {Component} from "@angular/core";
import {Router, RouteParams} from '@angular/router-deprecated';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTResource, ARTURIResource, ARTLiteral, RDFResourceRolesEnum, RDFTypesEnum} from "../../utils/ARTResources";
import {RDFS, SKOS, SKOSXL} from "../../utils/Vocabulary";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {PropertyServices} from "../../services/propertyServices";
import {SkosServices} from "../../services/skosServices";
import {SkosxlServices} from "../../services/skosxlServices";

@Component({
    selector: "no-lang-label-component",
    templateUrl: "app/src/icv/noLangLabel/noLangLabelComponent.html",
    providers: [IcvServices, SkosServices, SkosxlServices, PropertyServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class NoLangLabelComponent {
    
    private brokenRecordList: Array<any>; //{resource: ARTURIResource, predicate: ARTURIResource, label: ARTLiteral(SKOS)/ARTResource(XL)}
    private ontoType: string;
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private propService: PropertyServices, private vbCtx: VocbenchCtx, private modalService: ModalServices,
        private router: Router, private routeParams: RouteParams) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }
    
    ngOnInit() {
        this.ontoType = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }
    
    /**
     * Run the check
     */
    runIcv() {
        //TODO check when service will be refactored
        if (this.ontoType == "SKOS") {
            document.getElementById("blockDivIcv").style.display = "block";
            this.icvService.listResourcesWithNoLanguageTagSKOSLabel().subscribe(
                records => {
                    this.brokenRecordList = records;
                    document.getElementById("blockDivIcv").style.display = "none";
                },
                err => { document.getElementById("blockDivIcv").style.display = "none"; }
            );
        } else if (this.ontoType == "SKOS-XL") {
            document.getElementById("blockDivIcv").style.display = "block";
            this.icvService.listResourcesWithNoLanguageTagSKOSXLLabel().subscribe(
                records => {
                    this.brokenRecordList = records;
                    document.getElementById("blockDivIcv").style.display = "none";
                },
                err => { document.getElementById("blockDivIcv").style.display = "none"; }
            );
        } else { //OWL 
            //TODO listResourcesWithNoLanguageRDFSLabel and should look for classes and individuals
            //individuals are also concept, so the service would return also all the cocnept with skos(xl) labels
            //what should I do?
        }
    }
    
    /**
     * Fixes resource by setting a language tag to the label. In order to do that, first removes the current
     * label, then adds a new one with language.
     */
    setLanguage(record) {
        if (this.ontoType == "SKOS") {
            let label: ARTLiteral = <ARTLiteral>record.label;
            this.modalService.newPlainLiteral("Set language", label.getLabel(), true).then(
                data => {
                    var lang = data.lang;
                    if (record.predicate.getURI() == SKOS.prefLabel.getURI()) {
                        this.skosService.removePrefLabel(record.resource, label.getLabel()).subscribe(
                            stResp => {
                                this.skosService.setPrefLabel(record.resource, label.getLabel(), lang).subscribe(
                                    stResp => {
                                        this.runIcv();
                                    }
                                )
                            }
                        );
                    } else if (record.predicate.getURI() == SKOS.altLabel.getURI()) {
                        this.skosService.removeAltLabel(record.resource, label.getLabel()).subscribe(
                            stResp => {
                                this.skosService.addAltLabel(record.resource, label.getLabel(), lang).subscribe(
                                    stResp => {
                                        this.runIcv();
                                    }
                                )
                            }
                        );
                    } else if (record.predicate.getURI() == SKOS.hiddenLabel.getURI()) {
                        this.skosService.removeHiddenLabel(record.resource, label.getLabel()).subscribe(
                            stResp => {
                                this.skosService.addHiddenLabel(record.resource, label.getLabel(), lang).subscribe(
                                    stResp => {
                                        this.runIcv();
                                    }
                                )
                            }
                        );
                    }
                }
            );
        } else if (this.ontoType == "SKOS-XL") {
            let label: ARTResource = <ARTResource>record.label;
            this.modalService.newPlainLiteral("Set language", label.getShow(), true).then(
                data => {
                    var lang = data.lang;
                    this.skosxlService.changeLabelInfo(label, label.getShow(), lang).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    );
                }
            );
        }
    }

    /**
     * Fixes resource by removing the label.
     */
    removeLabel(record) {
        if (this.ontoType == "SKOS") {
            if (record.predicate.getURI() == SKOS.prefLabel.getURI()) {
                this.skosService.removePrefLabel(record.resource, (<ARTLiteral>record.label).getLabel()).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            } else if (record.predicate.getURI() == SKOS.altLabel.getURI()) {
                this.skosService.removeAltLabel(record.resource, (<ARTLiteral>record.label).getLabel()).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            } else if (record.predicate.getURI() == SKOS.hiddenLabel.getURI()) {
                this.skosService.removeHiddenLabel(record.resource, (<ARTLiteral>record.label).getLabel()).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            }
        } else if (this.ontoType == "SKOS-XL") {
            if (record.predicate.getURI() == SKOSXL.prefLabel.getURI()) {
                this.skosxlService.removePrefLabel(record.resource, (<ARTResource>record.label).getShow()).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            } else if (record.predicate.getURI() == SKOSXL.altLabel.getURI()) {
                this.skosxlService.removeAltLabel(record.resource, (<ARTResource>record.label).getShow()).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            } else if (record.predicate.getURI() == SKOSXL.hiddenLabel.getURI()) {
                this.skosxlService.removeHiddenLabel(record.resource, (<ARTResource>record.label).getShow()).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            }
        }
    }
    
}