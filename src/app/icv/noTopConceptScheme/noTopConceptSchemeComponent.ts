import { Component, ElementRef, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin } from 'rxjs';
import { SKOS } from "src/app/models/Vocabulary";
import { VBActionFunctionCtx, VBActionFunctions, VBActionsEnum } from "src/app/utils/VBActions";
import { ARTURIResource } from "../../models/ARTResources";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "no-top-concept-scheme-component",
    templateUrl: "./noTopConceptSchemeComponent.html",
    host: { class: "pageComponent" }
})
export class NoTopConceptSchemeComponent {

    @ViewChild('blockDivIcv', { static: true }) public blockingDivElement: ElementRef;

    brokenSchemeList: Array<ARTURIResource>;

    constructor(private icvService: IcvServices, private skosService: SkosServices,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices,
        private creationModals: CreationModalServices, private sharedModals: SharedModalServices,
        private translateService: TranslateService) { }

    /**
     * Run the check
     */
    runIcv() {
        //TODO check when service will be refactored
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.icvService.listConceptSchemesWithNoTopConcept().subscribe(
            schemes => {
                this.brokenSchemeList = schemes;
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
            }
        );
    }

    /**
     * Fixes scheme by selecting a top concept 
     */
    selectTopConcept(scheme: ARTURIResource) {
        this.browsingModals.browseConceptTree({ key: "DATA.ACTIONS.SELECT_CONCEPT" }, [scheme], true).then(
            (concept: any) => {
                this.skosService.addTopConcept(concept, scheme).subscribe(
                    () => {
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
        let vbActions = new VBActionFunctions(this.skosService, null, null, null, null, null, this.basicModals, this.creationModals, this.translateService);
        let createTopFn = vbActions.getFunction(VBActionsEnum.skosCreateTopConcept);
        let fnCtx: VBActionFunctionCtx = { metaClass: SKOS.concept, loadingDivRef: this.blockingDivElement, schemes: [scheme] }
        createTopFn(fnCtx).subscribe(
            () => {
                this.runIcv();
            },
            () => { }
        );
    }

    /**
     * Fixes scheme by deleting it 
     */
    deleteScheme(scheme: ARTURIResource) {
        this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.DELETE_SCHEME_WITHOUT_TOP_WARN_CONFIRM" }).then(
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
        this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.DELETE_SCHEMES_WITHOUT_TOP_WARN_CONFIRM" }).then(
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