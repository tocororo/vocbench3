import { Component } from "@angular/core";
import { RefactorServices } from "../../../services/refactorServices";
import { VocbenchCtx } from "../../../utils/VocbenchCtx";
import { ModalServices } from "../../../widget/modal/modalServices";

@Component({
    selector: "refactor-component",
    templateUrl: "./refactorComponent.html",
    host: { class: "pageComponent" },
})
export class RefactorComponent {

    private ontoType: string; //OWL, SKOS, SKOS-XL
    
    private reifyNotes: boolean = false; //used in skos->skoxl

    constructor(private refactorService: RefactorServices, private modalService: ModalServices, private vbCtx: VocbenchCtx) { }

    ngOnInit() {
        this.ontoType = this.vbCtx.getWorkingProject().getPrettyPrintOntoType();
    }

    private isSkosProject(): boolean {
        return this.ontoType.includes("SKOS");
    }

    private isSkosxlProject(): boolean {
        return this.ontoType == "SKOS-XL";
    }

    private skosToSkosxl() {
        this.modalService.confirm("SKOS to SKOS-XL", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.refactorService.SKOStoSKOSXL(this.reifyNotes).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                    },
                    err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                );
            },
            () => {}
        );
    }

    private skosxlToSkos() {
        this.modalService.confirm("SKOS-XL to SKOS", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.refactorService.SKOSXLtoSKOS().subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                    },
                    err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                );
            },
            () => {}
        );
    }

    //TODO: some event in order to destroy the data component
    private migrateData() {
        this.modalService.confirm("Migrate data", "This could be a long process. Are you sure to continue?", "warning").then(
            confirm => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.refactorService.migrateDefaultGraphToBaseURIGraph().subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                    },
                    err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                );
            },
            () => {}
        );
    }

}