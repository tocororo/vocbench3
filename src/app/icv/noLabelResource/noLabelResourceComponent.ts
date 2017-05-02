import { Component } from "@angular/core";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, RDFTypesEnum } from "../../models/ARTResources";
import { RDFS } from "../../models/Vocabulary";
import { VBContext } from "../../utils/VBContext";
import { IcvServices } from "../../services/icvServices";
import { PropertyServices } from "../../services/propertyServices";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";

@Component({
    selector: "no-label-resource-component",
    templateUrl: "./noLabelResourceComponent.html",
    host: { class: "pageComponent" }
})
export class NoLabelResourceComponent {

    private brokenResourceList: Array<ARTURIResource>;
    private ontoType: string;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private propService: PropertyServices, private creationModal: CreationModalServices) { }

    ngOnInit() {
        this.ontoType = VBContext.getWorkingProject().getPrettyPrintOntoType();
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
            this.creationModal.newPlainLiteral("Add skos:prefLabel").then(
                (data: any) => {
                    this.skosService.setPrefLabel(resource, data.value, data.lang).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    )
                },
                () => { }
            );
        } else if (this.ontoType == "SKOS-XL") {
            this.creationModal.newPlainLiteral("Add skosxl:prefLabel").then(
                (data: any) => {
                    this.skosxlService.setPrefLabel(resource, data.value, data.lang, RDFTypesEnum.uri).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    )
                },
                () => { }
            );
        } else { //OWL 
            this.creationModal.newPlainLiteral("Add rdfs:label").then(
                (data: any) => {
                    this.propService.createAndAddPropValue(resource, RDFS.label, data.value, null, RDFTypesEnum.plainLiteral, data.lang).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    )
                },
                () => { }
            );
        }
    }

}