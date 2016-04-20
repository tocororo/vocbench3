import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {InputOutputServices} from "../../../services/inputOutputServices";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {ModalServices} from "../../../widget/modal/modalServices";

@Component({
	selector: "import-data-component",
	templateUrl: "app/src/config/dataManagement/importData/importDataComponent.html",
    providers: [InputOutputServices],
    host: { class : "pageComponent" }
})
export class ImportDataComponent {
    
    private baseURI: string;
    private format: string = "RDF/XML";
    private fileToUpload: File;
    
    private submitted: boolean = false;
    
    constructor(private inOutService: InputOutputServices, private vbCtx: VocbenchCtx,
            private modalService: ModalServices, private router: Router) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        }
        //navigate to Projects view if a project is not selected
        if (vbCtx.getWorkingProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    private fileChangeEvent(file: File) {
        this.fileToUpload = file;
    }
    
    private import() {
        this.submitted = true;
        if (this.baseURI && this.baseURI.trim() != "" && this.fileToUpload) {
            document.getElementById("blockDivFullScreen").style.display = "block";
            this.inOutService.loadRDF(this.fileToUpload, this.baseURI, this.format).subscribe(
                stResp => {
                    this.modalService.alert("Import data", "Data imported successfully");
                },
                err => { },
                () => document.getElementById("blockDivFullScreen").style.display = "none"
            );
        }
    }
    
}