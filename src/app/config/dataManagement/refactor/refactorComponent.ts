import { Component } from "@angular/core";
import { RefactorServices } from "../../../services/refactorServices";
import { VBContext } from "../../../utils/VBContext";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "refactor-component",
    templateUrl: "./refactorComponent.html",
    host: { class: "pageComponent" },
})
export class RefactorComponent {

    private ontoType: string; //OWL, SKOS, SKOS-XL
    
    private reifyNotes: boolean = false; //used in skos->skoxl

    constructor(private refactorService: RefactorServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.ontoType = VBContext.getWorkingProject().getPrettyPrintOntoType();
    }

    private isSkosProject(): boolean {
        return this.ontoType.includes("SKOS");
    }

    private isSkosxlProject(): boolean {
        return this.ontoType == "SKOS-XL";
    }

    private skosToSkosxl() {
        this.basicModals.confirm("SKOS to SKOS-XL", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
                this.refactorService.SKOStoSKOSXL(this.reifyNotes).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                    },
                    err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen")); }
                );
            },
            () => {}
        );
    }

    private skosxlToSkos() {
        this.basicModals.confirm("SKOS-XL to SKOS", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
                this.refactorService.SKOSXLtoSKOS().subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                    },
                    err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen")); }
                );
            },
            () => {}
        );
    }

    //TODO: some event in order to destroy the data component
    private migrateData() {
        this.basicModals.confirm("Migrate data", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
                this.refactorService.migrateDefaultGraphToBaseURIGraph().subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                    },
                    err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen")); }
                );
            },
            () => {}
        );
    }

}