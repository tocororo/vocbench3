import {Component} from "@angular/core";
import {InputOutputServices} from "../../../services/inputOutputServices";
import {ModalServices} from "../../../widget/modal/modalServices";
import {VBEventHandler} from "../../../utils/VBEventHandler";

@Component({
    selector: "import-data-component",
    templateUrl: "./importDataComponent.html",
    host: { class : "pageComponent" }
})
export class ImportDataComponent {
    
    private baseURI: string;
    private format: string = "inferFromFile";
    private fileToUpload: File;
    
    private submitted: boolean = false;
    
    constructor(private inOutService: InputOutputServices, private modalService: ModalServices) { }
    
    private fileChangeEvent(file: File) {
        this.fileToUpload = file;
    }

    private load() {
        this.submitted = true;
        if (this.baseURI && this.baseURI.trim() != "" && this.fileToUpload) {
            document.getElementById("blockDivFullScreen").style.display = "block";
            var rdfFormat: string;
            if (this.format != "inferFromFile") {
                rdfFormat = this.format;
            } //if format != inferFromFile => rdfFormat in null, so the loadRDF service will infer the format
            this.inOutService.loadRDF(this.fileToUpload, this.baseURI, rdfFormat).subscribe(
                stResp => {
                    document.getElementById("blockDivFullScreen").style.display = "none";
                    this.modalService.alert("Import data", "Data imported successfully");
                },
                err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
            );
        }
    }
    
}