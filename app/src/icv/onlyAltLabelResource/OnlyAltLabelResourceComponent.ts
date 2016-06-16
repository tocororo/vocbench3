import {Component} from "@angular/core";
import {Router, RouteParams} from '@angular/router-deprecated';
import {Observable} from 'rxjs/Observable';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource, ARTLiteral, RDFResourceRolesEnum, RDFTypesEnum} from "../../utils/ARTResources";
import {RDFS} from "../../utils/Vocabulary";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {SkosServices} from "../../services/skosServices";
import {SkosxlServices} from "../../services/skosxlServices";

@Component({
    selector: "only-alt-label-resource-component",
    templateUrl: "app/src/icv/onlyAltLabelResource/onlyAltLabelResourceComponent.html",
    providers: [IcvServices, SkosServices, SkosxlServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class OnlyAltLabelResourceComponent {
    
    private brokenRecordList: Array<any>; //TODO should be {resource: ..., lang: ..., altLabels: [...]}
    //idea: make lang a ARTLiteral so in the view is rendered as rdf-resource with the flag
    private ontoType: string;
    private resourceType: string; //resource without label (concept, conceptScheme)
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private vbCtx: VocbenchCtx, private modalService: ModalServices,
        private router: Router, private routeParams: RouteParams) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
        this.resourceType = this.routeParams.get("type");
    }
    
    ngOnInit() {
        this.ontoType = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }
    
    /**
     * Run the check
     * TODO the service should be refactore so that it will return a <record> element with
     * - <uri> the resource with alt label but not prefLabel
     * - <altLabels> containing a collection of <uri> or <plainLiteral> respectively for skosxl and skos
     *   that list the alternative labels.
     * In this way, I can do fix "change alt to pref", and where there are multiple altLabels (for the same lang)
     * let the user chose which one set as preferred
     */
    runIcv() {
        //TODO check when service will be refactored
        if (this.ontoType == "SKOS") {
            if (this.resourceType == RDFResourceRolesEnum.concept) {
                document.getElementById("blockDivIcv").style.display = "block";
                this.icvService.listConceptsWithOnlySKOSAltLabel().subscribe(
                    stResp => {
                        //TODO
                        document.getElementById("blockDivIcv").style.display = "none";
                    },
                    err => { document.getElementById("blockDivIcv").style.display = "none"; }
                );
            } else if (this.resourceType == RDFResourceRolesEnum.conceptScheme) {
                document.getElementById("blockDivIcv").style.display = "block";
                this.icvService.listConceptsWithOnlySKOSXLAltLabel().subscribe(
                    stResp => {
                        //TODO
                        document.getElementById("blockDivIcv").style.display = "none";
                    },
                    err => { document.getElementById("blockDivIcv").style.display = "none"; }
                );
            }
        } else if (this.ontoType == "SKOS-XL") {
            //TODO create services for conceptScheme
            if (this.resourceType == RDFResourceRolesEnum.concept) {
                // document.getElementById("blockDivIcv").style.display = "block";
                // this.icvService.listConceptsWithNoSKOSXLPrefLabel().subscribe(
                //     stResp => {
                        
                //     },
                //     err => { },
                //     () => document.getElementById("blockDivIcv").style.display = "none"
                // );
            } else if (this.resourceType == RDFResourceRolesEnum.conceptScheme) {
                // document.getElementById("blockDivIcv").style.display = "block";
                // this.icvService.listConceptSchemesWithNoSKOSXLPrefLabel().subscribe(
                //     stResp => {
                        
                //     },
                //     err => { },
                //     () => document.getElementById("blockDivIcv").style.display = "none"
                // );
            }
        }
    }
    
    /**
     * Fixes resource by setting the alternative label as preferred
     */
    setAltAsPrefLabel(record) {
        var newPrefLabel: ARTLiteral;
        if (record.altLabels.length == 1) {//just one alt label -> set it as prefLabel
            newPrefLabel = record.altLabels[0];
            this.changeAltToPref(record.resource, newPrefLabel).subscribe(
                () => {
                    this.runIcv();
                }
            );
        } else {//multiple alt label -> ask the user which one to set as prefLabel
            this.modalService.selectResource("Set preferred label", "Select the alternative label to set as preferred", record.altLabels).then(
                selected => {
                    newPrefLabel = selected;
                    this.changeAltToPref(record.resource, newPrefLabel).subscribe(
                        () => {
                            this.runIcv();
                        }
                    );
                },
                () => {}
            )
        }
    }
    
    /**
     * Removes an alt label and set it as pref label. Returns an observable so that
     * in setAltAsPrefLabel it can be subscribed and execute operations once it's done
     */
    private changeAltToPref(resource: ARTURIResource, label: ARTLiteral) {
        return new Observable(observer => {
            if (this.ontoType == "SKOS") {
                this.skosService.removeAltLabel(resource, label.getLabel(), label.getLang()).subscribe(
                    stResp => {
                        this.skosService.setPrefLabel(resource, label.getLabel(), label.getLang()).subscribe(
                            stResp => {
                                observer.next();
                                observer.complete();
                            }
                        )
                    }
                );
            } else if (this.ontoType == "SKOS-XL") {
                this.skosxlService.removeAltLabel(resource, label.getLabel(), label.getLang()).subscribe(
                    stResp => {
                        this.skosxlService.setPrefLabel(resource, label.getLabel(), label.getLang(), RDFTypesEnum.uri).subscribe(
                            stResp => {
                                observer.next();
                                observer.complete();
                            }
                        )
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
                }
            )
        } else if (this.ontoType == "SKOS-XL") {
            this.modalService.newPlainLiteral("Add skosxl:prefLabel").then(
                data => {
                    this.skosxlService.setPrefLabel(record.resource, data.value, data.lang, RDFTypesEnum.uri).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    )
                }
            )
        }
    }
    
}