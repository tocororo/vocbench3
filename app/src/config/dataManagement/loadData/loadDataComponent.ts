import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {NgForm} from 'angular2/common';
import {InputOutputServices} from "../../../services/inputOutputServices";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";

@Component({
	selector: "load-data-component",
	templateUrl: "app/src/config/dataManagement/loadData/loadDataComponent.html",
    providers: [InputOutputServices]
})
export class LoadDataComponent {
    
    private baseURI: string;
    private format: string = "RDF/XML";
    private fileToUpload: File;
    
    private submitted: boolean = false;
    
    constructor(private inOutService: InputOutputServices, private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
            router.navigate(['Projects']);
        }
    }
    
    private fileChangeEvent(file: File) {
        this.fileToUpload = file;
    }
    
    private upload() {
        this.submitted = true;
        if (this.baseURI && this.baseURI.trim() != "" && this.fileToUpload) {
            document.getElementById("blockDivFullScreen").style.display = "block";
            this.inOutService.loadRDF(this.fileToUpload, this.baseURI, this.format).subscribe(
                stResp => {
                    document.getElementById("blockDivFullScreen").style.display = "none"
                    alert("File uploaded successfully");
                },
                err => {
                    document.getElementById("blockDivFullScreen").style.display = "none"
                    alert("Error: " + err);
                    console.error(err['stack']);
                });
        }
    }
    
}