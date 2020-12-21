import { Component } from "@angular/core";
import { forkJoin } from 'rxjs';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { NewConceptCfModalReturnData } from "../../widget/modal/creationModal/newResourceModal/skos/newConceptCfModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "no-top-concept-scheme-component",
    templateUrl: "./noTopConceptSchemeComponent.html",
    host: { class: "pageComponent" }
})
export class NoTopConceptSchemeComponent {

    brokenSchemeList: Array<ARTURIResource>;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private preferences: VBProperties,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices,
        private creationModals: CreationModalServices, private sharedModals: SharedModalServices) { }

    /**
     * Run the check
     */
    runIcv() {
        //TODO check when service will be refactored
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConceptSchemesWithNoTopConcept().subscribe(
            schemes => {
                this.brokenSchemeList = schemes;
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
            }
        );
    }

    /**
     * Fixes scheme by selecting a top concept 
     */
    selectTopConcept(scheme: ARTURIResource) {
        this.browsingModals.browseConceptTree({key:"ACTIONS.SELECT_CONCEPT"}, [scheme], true).then(
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
        this.creationModals.newConceptCf({key:"ACTIONS.CREATE_CONCEPT"}, null, null, null, true).then(
            (data: NewConceptCfModalReturnData) => {
                this.skosService.createConcept(data.label, data.schemes, data.uriResource, null, data.cls, null, data.cfValue).subscribe(
                    stResp => {
                        this.runIcv();
                    },
                    (err: Error) => {
                        if (err.name.endsWith('PrefAltLabelClashException')) {
                            this.basicModals.confirm({key:"STATUS.WARNING"}, err.message + " Do you want to force the creation?", ModalType.warning).then(
                                confirm => {
                                    this.skosService.createConcept(data.label, data.schemes, data.uriResource, null, data.cls, null, data.cfValue, false).subscribe(
                                        stResp => {
                                            this.runIcv();
                                        },
                                    );
                                },
                                reject => {}
                            )
                        }
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Fixes scheme by deleting it 
     */
    deleteScheme(scheme: ARTURIResource) {
        this.basicModals.confirm({key:"ACTIONS.DELETE_SCHEME"}, "Warning, deleting this scheme, if it contains some concepts, " +
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
        this.basicModals.confirm({key:"ACTIONS.DELETE_SCHEME"}, "Warning, deleting the schemes, if they contain some concepts, " +
            "will generate concepts in no scheme. Are you sure to proceed?").then(
            confirm => {
                var deleteSchemeFnArray: any[] = [];
                deleteSchemeFnArray = this.brokenSchemeList.map((sc) => this.skosService.deleteConceptScheme(sc));
                //call the collected functions and subscribe when all are completed
                forkJoin(deleteSchemeFnArray).subscribe(
                    () => {
                        this.runIcv();
                    }
                );
            },
            () => { }
        );
    }

    private onResourceClick(res: ARTURIResource) {
        this.sharedModals.openResourceView(res, false);
    }

}