import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { SKOS, SKOSXL } from "../../models/Vocabulary";
import { VBPreferences } from "../../utils/VBPreferences";
import { VBContext } from "../../utils/VBContext";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";

@Component({
    selector: "no-top-concept-scheme-component",
    templateUrl: "./noTopConceptSchemeComponent.html",
    host: { class: "pageComponent" }
})
export class NoTopConceptSchemeComponent {

    private brokenSchemeList: Array<ARTURIResource>;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private preferences: VBPreferences, private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices,
        private creationModals: CreationModalServices) { }

    /**
     * Run the check
     */
    runIcv() {
        //TODO check when service will be refactored
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConceptSchemesWithNoTopConcept().subscribe(
            stResp => {
                this.brokenSchemeList = new Array();
                var schemeColl = stResp.getElementsByTagName("conceptScheme");
                for (var i = 0; i < schemeColl.length; i++) {
                    var s = new ARTURIResource(schemeColl[i].textContent, schemeColl[i].textContent, RDFResourceRolesEnum.conceptScheme);
                    this.brokenSchemeList.push(s);
                }
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
            },
            err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv")); }
        );
    }

    /**
     * Fixes scheme by selecting a top concept 
     */
    selectTopConcept(scheme: ARTURIResource) {
        this.browsingModals.browseConceptTree("Select a top concept", [scheme], true).then(
            (concept: any) => {
                this.skosService.addTopConcept(concept, scheme).subscribe(
                    (stResp: any) => {
                        this.runIcv();
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Fixes scheme by creating a top concept 
     */
    createTopConcept(scheme: ARTURIResource) {
        let ontoType = VBContext.getWorkingProject().getLexicalizationModelType();
        this.creationModals.newConceptCf("Create new skos:Concept", null, true).then(
            (data: any) => {
                if (ontoType == SKOS.uri) {
                    this.skosService.createTopConcept(data.label, data.schemes, data.uriResource, data.cls, data.cfId, data.cfValueMap).subscribe(
                        stResp => {
                            this.runIcv();
                        }
                    );
                } else { //SKOSXL
                    this.skosxlService.createTopConcept(data.label, data.schemes, data.uriResource, data.cls, data.cfId, data.cfValueMap).subscribe(
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
     * Fixes scheme by deleting it 
     */
    deleteScheme(scheme: ARTURIResource) {
        this.basicModals.confirm("Delete scheme", "Warning, deleting this scheme, if it contains some concepts, " +
            "will generate concepts in no scheme. Are you sure to proceed?").then(
            result => {
                this.skosService.deleteConceptScheme(scheme).subscribe(
                    stResp => {
                        this.runIcv();
                    }
                );
            },
            () => { }
            );
    }

    /**
     * Fixes schemes by deleting them all 
     */
    deleteAllScheme() {
        this.basicModals.confirm("Delete scheme", "Warning, deleting the schemes, if they contain some concepts, " +
            "will generate concepts in no scheme. Are you sure to proceed?").then(
            confirm => {
                var deleteSchemeFnArray: any[] = [];
                deleteSchemeFnArray = this.brokenSchemeList.map((sc) => this.skosService.deleteConceptScheme(sc));
                //call the collected functions and subscribe when all are completed
                Observable.forkJoin(deleteSchemeFnArray).subscribe(
                    res => {
                        this.runIcv();
                    }
                );
            },
            () => { }
            );
    }

}