import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {InputOutputServices} from "../../../services/inputOutputServices";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";

@Component({
	selector: "export-data-component",
	templateUrl: "app/src/config/dataManagement/exportData/exportDataComponent.html",
    providers: [InputOutputServices],
    host: { class : "pageComponent" }
})
export class ExportDataComponent {
    
    private format: string = "RDF/XML";
    
    private downloadLink;
    
    constructor(private inOutService: InputOutputServices, private vbCtx: VocbenchCtx, private router: Router) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }
    
    private export() {
        document.getElementById("blockDivFullScreen").style.display = "block";
        window.URL.revokeObjectURL(this.downloadLink);
        this.inOutService.saveRDF(this.format).subscribe(
            stResp => {
                var data = new Blob([stResp], {type: "octet/stream"});
                this.downloadLink = window.URL.createObjectURL(data);
            },
            err => { },
            () => document.getElementById("blockDivFullScreen").style.display = "none"
        );
    }
    
}