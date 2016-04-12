import {Component} from "angular2/core";
import {Router, RouteParams} from 'angular2/router';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource} from "../../utils/ARTResources";
import {RDFResourceRolesEnum, RDFTypesEnum} from "../../utils/Enums";
import {RDFS} from "../../utils/Vocabulary";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {IcvServices} from "../../services/icvServices";
import {PropertyServices} from "../../services/propertyServices";
import {SkosServices} from "../../services/skosServices";
import {SkosxlServices} from "../../services/skosxlServices";

@Component({
    selector: "no-label-resource-component",
    templateUrl: "app/src/icv/noLabelResource/noLabelResourceComponent.html",
    providers: [IcvServices, SkosServices, SkosxlServices, PropertyServices],
    directives: [RdfResourceComponent],
    host: { class : "pageComponent" }
})
export class NoLabelResourceComponent {
    
    private brokenResourceList: Array<ARTURIResource>;
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
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
        this.resourceType = this.routeParams.get("type");
    }
    
    ngOnInit() {
        this.ontoType = this.vbCtx.getProject().getPrettyPrintOntoType();
    }
    
    /**
     * Run the check
     */
    runIcv() {
        //TODO check when service will be refactored
        if (this.ontoType == "SKOS") {
            if (this.resourceType == RDFResourceRolesEnum.concept) {
                document.getElementById("blockDivIcv").style.display = "block";
                this.icvService.listConceptsWithNoSKOSPrefLabel().subscribe(
                    stResp => {
                        this.brokenResourceList = new Array();
                        var conceptColl = stResp.getElementsByTagName("concept");
                        for (var i = 0; i < conceptColl.length; i++) {
                            var c = new ARTURIResource(conceptColl[i].textContent, conceptColl[i].textContent, RDFResourceRolesEnum.concept); 
                            this.brokenResourceList.push(c);
                        }
                    },
                    err => { },
                    () => document.getElementById("blockDivIcv").style.display = "none"
                );
            } else if (this.resourceType == RDFResourceRolesEnum.conceptScheme) {
                document.getElementById("blockDivIcv").style.display = "block";
                this.icvService.listConceptSchemesWithNoSKOSPrefLabel().subscribe(
                    stResp => {
                        this.brokenResourceList = new Array();
                        var schemeColl = stResp.getElementsByTagName("scheme");
                        for (var i = 0; i < schemeColl.length; i++) {
                            var c = new ARTURIResource(schemeColl[i].textContent, schemeColl[i].textContent, RDFResourceRolesEnum.conceptScheme); 
                            this.brokenResourceList.push(c);
                        }
                    },
                    err => { },
                    () => document.getElementById("blockDivIcv").style.display = "none"
                );
            }
        } else if (this.ontoType == "SKOS-XL") {
            if (this.resourceType == RDFResourceRolesEnum.concept) {
                document.getElementById("blockDivIcv").style.display = "block";
                this.icvService.listConceptsWithNoSKOSXLPrefLabel().subscribe(
                    stResp => {
                        this.brokenResourceList = new Array();
                        var conceptColl = stResp.getElementsByTagName("concept");
                        for (var i = 0; i < conceptColl.length; i++) {
                            var c = new ARTURIResource(conceptColl[i].textContent, conceptColl[i].textContent, RDFResourceRolesEnum.concept); 
                            this.brokenResourceList.push(c);
                        }
                    },
                    err => { },
                    () => document.getElementById("blockDivIcv").style.display = "none"
                );
            } else if (this.resourceType == RDFResourceRolesEnum.conceptScheme) {
                document.getElementById("blockDivIcv").style.display = "block";
                this.icvService.listConceptSchemesWithNoSKOSXLPrefLabel().subscribe(
                    stResp => {
                        this.brokenResourceList = new Array();
                        var schemeColl = stResp.getElementsByTagName("scheme");
                        for (var i = 0; i < schemeColl.length; i++) {
                            var c = new ARTURIResource(schemeColl[i].textContent, schemeColl[i].textContent, RDFResourceRolesEnum.conceptScheme); 
                            this.brokenResourceList.push(c);
                        }
                    },
                    err => { },
                    () => document.getElementById("blockDivIcv").style.display = "none"
                );
            }
        } else { //OWL 
            //TODO
        }
    }
    
    /**
     * Fixes resource by setting a label 
     */
    fix(resource: ARTURIResource) {
        if (this.ontoType == "SKOS") {
            this.modalService.newPlainLiteral("Add skos:prefLabel").then(
                data => {
                    this.skosService.setPrefLabel(resource, data.value, data.lang).subscribe(
                        stResp => {
                            this.brokenResourceList.splice(this.brokenResourceList.indexOf(resource), 1);
                        }
                    )
                },
                () => {}
            );
        } else if (this.ontoType == "SKOS-XL") {
            this.modalService.newPlainLiteral("Add skosxl:prefLabel").then(
                data => {
                    this.skosxlService.setPrefLabel(resource, data.value, data.lang, RDFTypesEnum.bnode).subscribe(
                        stResp => {
                            this.brokenResourceList.splice(this.brokenResourceList.indexOf(resource), 1);
                        }
                    )
                },
                () => {}
            );
        } else { //OWL 
            this.modalService.newPlainLiteral("Add rdfs:label").then(
                data => {
                    this.propService.createAndAddPropValue(resource, RDFS.label, data.value, null, RDFTypesEnum.plainLiteral, data.lang).subscribe(
                        stResp => {
                            this.brokenResourceList.splice(this.brokenResourceList.indexOf(resource), 1);
                        }
                    )
                },
                () => {}
            );
        }
    }
    
}