import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { PrefLabelClashMode } from "src/app/models/Properties";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalType } from "src/app/widget/modal/Modals";
import { ARTLiteral, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { SKOS, SKOSXL } from "../../models/Vocabulary";
import { IcvServices } from "../../services/icvServices";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { VBContext } from "../../utils/VBContext";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { NewXLabelModalReturnData } from "../../widget/modal/creationModal/newResourceModal/skos/newXLabelModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "no-label-resource-component",
    templateUrl: "./noLabelResourceComponent.html",
    host: { class: "pageComponent" }
})
export class NoLabelResourceComponent {

    brokenResourceList: Array<ARTResource>;
    private lexicalizationModel: string;
    title: string;
    private actionLabel: string;

    constructor(private icvService: IcvServices, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private basicModals: BasicModalServices, private creationModals: CreationModalServices, private sharedModals: SharedModalServices,
        private translateService: TranslateService) { }

    ngOnInit() {
        this.lexicalizationModel = VBContext.getWorkingProject().getLexicalizationModelType();
        if (this.lexicalizationModel == SKOS.uri) {
            this.title = "ICV.LABEL.NO_SKOS_PREFLABEL.NAME";
            this.actionLabel = "ICV.LABEL.NO_SKOS_PREFLABEL.ADD_PREFLABEL";
        } else if (this.lexicalizationModel == SKOSXL.uri) {
            this.title = "ICV.LABEL.NO_SKOSXL_PREFLABEL.NAME";
            this.actionLabel = "ICV.LABEL.NO_SKOSXL_PREFLABEL.ADD_PREFLABEL";
        }
    }

    /**
     * Run the check
     */
    runIcv() {
        if (this.lexicalizationModel == SKOS.uri) {
            this.icvService.listResourcesWithNoSKOSPrefLabel().subscribe(
                brokenRes => {
                    this.brokenResourceList = brokenRes;
                }
            );
        } else if (this.lexicalizationModel == SKOSXL.uri) {
            this.icvService.listResourcesWithNoSKOSXLPrefLabel().subscribe(
                brokenRes => {
                    this.brokenResourceList = brokenRes;
                }
            );
        }
    }

    /**
     * Fixes resource by setting a label 
     */
    fix(resource: ARTURIResource) {
        let clashLabelMode: PrefLabelClashMode = VBContext.getWorkingProjectCtx().getProjectSettings().prefLabelClashMode;
        let checkExistingPrefLabel: boolean = clashLabelMode != PrefLabelClashMode.allow; //if not "allow" (forbid or warning) enable the check

        if (this.lexicalizationModel == SKOS.uri) {
            this.creationModals.newPlainLiteral({ key: "ACTIONS.ADD_X", params: { x: SKOS.prefLabel.getShow() } }).then(
                (literal: ARTLiteral[]) => {
                    this.setPrefLabel(resource, literal[0], clashLabelMode, null, null, checkExistingPrefLabel);
                },
                () => { }
            );
        } else if (this.lexicalizationModel == SKOSXL.uri) {
            this.creationModals.newXLabel({ key: "ACTIONS.ADD_X", params: { x: SKOSXL.prefLabel.getShow() } }).then(
                (data: NewXLabelModalReturnData) => {
                    this.setPrefLabel(resource, data.labels[0], clashLabelMode, data.cls, null, checkExistingPrefLabel);
                },
                () => { }
            );
        }
    }

    private setPrefLabel(resource: ARTURIResource, label: ARTLiteral, clashLabelMode: PrefLabelClashMode, labelCls?: ARTURIResource, checkAlt?: boolean, checkPref?: boolean) {
        let setPrefLabelFn: Observable<void>;
        if (this.lexicalizationModel == SKOS.uri) {
            setPrefLabelFn = this.skosService.setPrefLabel(resource, label, checkAlt, checkPref);
        } else { //skosxl
            setPrefLabelFn = this.skosxlService.setPrefLabel(resource, label, labelCls, checkAlt, checkPref);
        }
        setPrefLabelFn.subscribe(
            () => { //everything gone fine => re-run icv
                this.runIcv();
            },
            (err: Error) => {
                if (err.name.endsWith("PrefPrefLabelClashException")) {
                    let msg = err.message;
                    if (clashLabelMode == PrefLabelClashMode.warning) { //mode warning => ask user if he wants to force the operation
                        msg += ". " + this.translateService.instant("MESSAGES.FORCE_OPERATION_CONFIRM");
                        this.basicModals.confirm({ key: "STATUS.WARNING" }, msg, ModalType.warning).then(
                            confirm => {
                                this.setPrefLabel(resource, label, clashLabelMode, labelCls, null, false);
                            },
                            reject => { }
                        );
                    } else { //mode forbid => just show the error message
                        this.basicModals.alert({ key: "STATUS.WARNING" }, msg, ModalType.warning);
                    }
                } else if (err.name.endsWith("PrefAltLabelClashException")) {
                    let msg = err.message + " " + this.translateService.instant("MESSAGES.FORCE_OPERATION_CONFIRM");
                    this.basicModals.confirm({ key: "STATUS.WARNING" }, msg, ModalType.warning).then(
                        confirm => {
                            this.setPrefLabel(resource, label, clashLabelMode, labelCls, false);
                        },
                        reject => { }
                    );
                } else {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, err.message, ModalType.warning);
                }
            }

        );
    }

    onResourceClick(res: ARTResource) {
        this.sharedModals.openResourceView(res, false);
    }

}