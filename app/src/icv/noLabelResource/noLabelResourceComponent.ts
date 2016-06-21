import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {ARTURIResource, RDFTypesEnum} from "../../utils/ARTResources";
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
    
    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private propService: PropertyServices, private vbCtx: VocbenchCtx, private modalService: ModalServices, private router: Router) {
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
        if (this.ontoType == "SKOS") {
            this.icvService.listResourcesWithNoSKOSPrefLabel().subscribe(
                brokenRes => {
                    this.brokenResourceList = brokenRes;
                }
            );
        } else if (this.ontoType == "SKOS-XL") {
            this.icvService.listResourcesWithNoSKOSXLPrefLabel().subscribe(
                brokenRes => {
                    this.brokenResourceList = brokenRes;
                }
            );
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
                            this.runIcv();
                        }
                    )
                },
                () => {}
            );
        } else if (this.ontoType == "SKOS-XL") {
            this.modalService.newPlainLiteral("Add skosxl:prefLabel").then(
                data => {
                    this.skosxlService.setPrefLabel(resource, data.value, data.lang, RDFTypesEnum.uri).subscribe(
                        stResp => {
                            this.runIcv();
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
                            this.runIcv();
                        }
                    )
                },
                () => {}
            );
        }
    }
    
}