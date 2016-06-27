import {Component} from "@angular/core";
import {InputOutputServices} from "../../../services/inputOutputServices";
import {ModalServices} from "../../../widget/modal/modalServices";

@Component({
	selector: "export-data-component",
	templateUrl: "app/src/config/dataManagement/exportData/exportDataComponent.html",
    providers: [InputOutputServices],
    host: { class : "pageComponent" }
})
export class ExportDataComponent {
    
    private format: string = "RDF/XML";
    
    constructor(private inOutService: InputOutputServices, private modalService: ModalServices) {}
    
    /*
     * Currently the export function allows only to export in the available formats. It doesn't provide the same
     * capabilities of the export in VB2.x.x (export only a scheme, a subtree of a concept, ...) 
     * since VB3 uses the export service of SemanticTurkey. 
     */
    private export() {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.inOutService.saveRDF(this.format).subscribe(
            stResp => {
                document.getElementById("blockDivFullScreen").style.display = "none";
                var data = new Blob([stResp], {type: "octet/stream"});
                var downloadLink = window.URL.createObjectURL(data);
                this.modalService.downloadLink("Export data", null, downloadLink, "export.rdf");
            },
            err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
        );
    }
    
}