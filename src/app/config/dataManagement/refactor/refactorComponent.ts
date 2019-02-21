import { Component } from "@angular/core";
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

    private skosToSkosxlEnabled(): boolean {
        return this.lexicalizationModel == SKOSXL.uri;
    }

    private skosxlToSkosEnabled(): boolean {
        return (this.lexicalizationModel == SKOSXL.uri || this.lexicalizationModel == SKOSXL.uri);
    }

    private skosToSkosxl() {
        this.basicModals.confirm("SKOS to SKOS-XL", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.refactorService.SKOStoSKOSXL(this.reifyNotes).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert("Refactor", "Refactoring process completed");
                    }
                );
            },
            () => {}
        );
    }

    private skosxlToSkos() {
        this.basicModals.confirm("SKOS-XL to SKOS", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.refactorService.SKOSXLtoSKOS(this.flattenNotes).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert("Refactor", "Refactoring process completed");
                    }
                );
            },
            () => {}
        );
    }

    //TODO: some event in order to destroy the data component
    private migrateData() {
        this.basicModals.confirm("Migrate data", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.refactorService.migrateDefaultGraphToBaseURIGraph().subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.basicModals.alert("Refactor", "Refactoring process completed");
                    }
                );
            },
            () => {}
        );
    }

    //Authorizations
    private isMigrateAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorMigrateToBaseUriGraph);
    }
    private isSkosToSkosxlAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorSkosToSkosxl);
    }
    private isSkoxlToSkosAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorSkosxlToSkos);
    }

}