import { Component } from "@angular/core";
import { ModalType } from 'src/app/widget/modal/Modals';
import { SKOSXL } from "../../../models/Vocabulary";
import { RefactorServices } from "../../../services/refactorServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "refactor-component",
    templateUrl: "./refactorComponent.html",
    host: { class: "pageComponent" },
})
export class RefactorComponent {

    private lexicalizationModel: string; //RDFS, SKOS, SKOS-XL
    
    private reifyNotes: boolean = false; //used in skos->skoxl
    private flattenNotes: boolean = false; //used in skosxl->skos

    constructor(private refactorService: RefactorServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.lexicalizationModel = VBContext.getWorkingProject().getLexicalizationModelType();
    }

    skosToSkosxlEnabled(): boolean {
        return this.lexicalizationModel == SKOSXL.uri;
    }

    skosxlToSkosEnabled(): boolean {
        return (this.lexicalizationModel == SKOSXL.uri || this.lexicalizationModel == SKOSXL.uri);
    }

    skosToSkosxl() {
        this.basicModals.confirm({key:"DATA_MANAGEMENT.REFACTOR.SKOS_TO_SKOSXL"}, "This could be a long process. Are you sure to continue?", ModalType.warning).then(
            confirm => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.refactorService.SKOStoSKOSXL(this.reifyNotes).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert({key:"DATA_MANAGEMENT.REFACTOR.REFACTOR"}, "Refactoring process completed");
                    }
                );
            },
            () => {}
        );
    }

    skosxlToSkos() {
        this.basicModals.confirm({key:"DATA_MANAGEMENT.REFACTOR.SKOSXL_TO_SKOS"}, "This could be a long process. Are you sure to continue?", ModalType.warning).then(
            confirm => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.refactorService.SKOSXLtoSKOS(this.flattenNotes).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert({key:"DATA_MANAGEMENT.REFACTOR.REFACTOR"}, "Refactoring process completed");
                    }
                );
            },
            () => {}
        );
    }

    //TODO: some event in order to destroy the data component
    migrateData() {
        this.basicModals.confirm({key:"ACTIONS.MIGRATE_DATA_TO_BASEURI_GRAPH"}, "This could be a long process. Are you sure to continue?", ModalType.warning).then(
            confirm => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.refactorService.migrateDefaultGraphToBaseURIGraph().subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert({key:"DATA_MANAGEMENT.REFACTOR.REFACTOR"}, "Refactoring process completed");
                    }
                );
            },
            () => {}
        );
    }

    //Authorizations
    isMigrateAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorMigrateToBaseUriGraph);
    }
    isSkosToSkosxlAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorSkosToSkosxl);
    }
    isSkoxlToSkosAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorSkosxlToSkos);
    }

}