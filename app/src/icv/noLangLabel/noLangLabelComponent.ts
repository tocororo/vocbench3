import {Component} from "angular2/core";
import {Router, RouteParams} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource, ARTLiteral} from "../../utils/ARTResources";
import {RDFResourceRolesEnum, RDFTypesEnum} from "../../utils/Enums";
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
    
    private brokenRecordList: Array<any>; //{resource: ARTURIResource, labelProp: ARTURIResource, label: ARTLiteral}
    private ontoType: string;
    private resourceType: string; //resource without label (concept, cls, conceptScheme)
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private propService: PropertyServices, private vbCtx: VocbenchCtx, private modalService: ModalServices,
        private router: Router, private routeParams: RouteParams) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        }
        //navigate to Projects view if a project is not selected
        if (vbCtx.getWorkingProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    ngOnInit() {
        this.ontoType = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }
    
    /**
     * Run the check
     * TODO: change the service so that it gets both concept and conceptScheme in SKOS and SKOS-XL
     * and implements for OWL classes and individuals.
     * The service should return record with <uri> of the resource which label is broken, <uri> of the lexicalization property 
     * and <plainLiteral> for the label
     */
    runIcv() {
        //TODO check when service will be refactored
        if (this.ontoType == "SKOS") {
            document.getElementById("blockDivIcv").style.display = "block";
            //should be replaced by listResourcesWithNoLanguageSKOSLabel and should look for concept and conceptScheme
            this.icvService.listConceptsWithNoLanguageTagSKOSLabel().subscribe(
                stResp => {
                    
                },
                err => { },
                () => document.getElementById("blockDivIcv").style.display = "none"
            );
        } else if (this.ontoType == "SKOS-XL") {
            document.getElementById("blockDivIcv").style.display = "block";
            //should be replaced by listResourcesWithNoLanguageSKOSXLLabel and should look for concept and conceptScheme
            this.icvService.listConceptsWithNoLanguageTagSKOSXLLabel().subscribe(
                stResp => {
                    
                },
                err => { },
                () => document.getElementById("blockDivIcv").style.display = "none"
            );
        } else { //OWL 
            //TODO listResourcesWithNoLanguageRDFSLabel and should look for classes and individuals
        }
    }
    
    /**
     * Fixes resource by setting a language tag to the label. In order to do that, first removes the current
     * label, then adds a new one with language.
     */
    setLanguage(record) {
        if (this.ontoType == "SKOS") {
            this.modalService.newPlainLiteral("Set language", record.label.getLang(), true).then(
                data => {
                    if (record.labelProp == SKOS.prefLabel) {
                        this.skosService.removePrefLabel(record.resource, record.label.getLabel(), null).subscribe(
                            stResp => {
                                this.skosService.setPrefLabel(record.resource, record.label.getLabel(), data.lang).subscribe(
                                    stResp => {
                                        this.brokenRecordList.splice(this.brokenRecordList.indexOf(record), 1);
                                    }
                                )
                            }
                        )
                    } else if (record.labelProp == SKOS.altLabel) {
                        this.skosService.removeAltLabel(record.resource, record.label.getLabel(), null).subscribe(
                            stResp => {
                                this.skosService.addAltLabel(record.resource, record.label.getLabel(), data.lang).subscribe(
                                    stResp => {
                                        this.brokenRecordList.splice(this.brokenRecordList.indexOf(record), 1);
                                    }
                                )
                            }
                        )
                    } else if (record.labelProp == SKOS.hiddenLabel) {
                        this.skosService.removeHiddenLabel(record.resource, record.label.getLabel(), null).subscribe(
                            stResp => {
                                this.skosService.addHiddenLabel(record.resource, record.label.getLabel(), data.lang).subscribe(
                                    stResp => {
                                        this.brokenRecordList.splice(this.brokenRecordList.indexOf(record), 1);
                                    }
                                )
                            }
                        )
                    }
                },
                () => {}
            );
        } else if (this.ontoType == "SKOS-XL") {
            this.modalService.newPlainLiteral("Add skosxl:prefLabel", record.label.getLang(), true).then(
                data => {
                    if (record.labelProp == SKOSXL.prefLabel) {
                        this.skosxlService.removePrefLabel(record.resource, record.label.getLabel(), null).subscribe(
                            stResp => {
                                this.skosxlService.setPrefLabel(record.resource, record.label.getLabel(), data.lang, RDFTypesEnum.bnode).subscribe(
                                    stResp => {
                                        this.brokenRecordList.splice(this.brokenRecordList.indexOf(record), 1);
                                    }
                                )
                            }
                        )
                    } else if (record.labelProp == SKOSXL.altLabel) {
                        this.skosxlService.removeAltLabel(record.resource, record.label.getLabel(), null).subscribe(
                            stResp => {
                                this.skosxlService.addAltLabel(record.resource, record.label.getLabel(), data.lang, RDFTypesEnum.bnode).subscribe(
                                    stResp => {
                                        this.brokenRecordList.splice(this.brokenRecordList.indexOf(record), 1);
                                    }
                                )
                            }
                        )
                    } else if (record.labelProp == SKOSXL.hiddenLabel) {
                        this.skosxlService.removeHiddenLabel(record.resource, record.label.getLabel(), null).subscribe(
                            stResp => {
                                this.skosxlService.addHiddenLabel(record.resource, record.label.getLabel(), data.lang, RDFTypesEnum.bnode).subscribe(
                                    stResp => {
                                        this.brokenRecordList.splice(this.brokenRecordList.indexOf(record), 1);
                                    }
                                )
                            }
                        )
                    }
                },
                () => {}
            );
        } else { //OWL 
            this.modalService.newPlainLiteral("Add rdfs:label", record.label.getLang(), true).then(
                data => {
                    this.propService.removePropValue(record.resource, RDFS.label, record.label.getLabel(), null, RDFTypesEnum.plainLiteral).subscribe(
                        stResp => {
                            this.propService.createAndAddPropValue(record.resource, RDFS.label, record.label.getLabel(), null, RDFTypesEnum.plainLiteral, data.lang).subscribe(
                                stResp => {
                                    this.brokenRecordList.splice(this.brokenRecordList.indexOf(record), 1);
                                }
                            )
                        }
                    )
                },
                () => {}
            );
        }
    }
    
}