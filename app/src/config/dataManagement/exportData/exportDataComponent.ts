import {Component} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {InputOutputServices} from "../../../services/inputOutputServices";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {ModalServices} from "../../../widget/modal/modalServices";

@Component({
	selector: "export-data-component",
	templateUrl: "app/src/config/dataManagement/exportData/exportDataComponent.html",
    providers: [InputOutputServices],
    host: { class : "pageComponent" }
})
export class ExportDataComponent {
    
    private format: string = "RDF/XML";
    
    constructor(private inOutService: InputOutputServices, private vbCtx: VocbenchCtx, private router: Router,
        private modalService: ModalServices) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }
    
    private export() {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.inOutService.saveRDF(this.format).subscribe(
            stResp => {
                var data = new Blob([stResp], {type: "octet/stream"});
                var downloadLink = window.URL.createObjectURL(data);
                this.modalService.downloadLink("Export data", null, downloadLink, "export.rdf");
            },
            err => { },
            () => document.getElementById("blockDivFullScreen").style.display = "none"
        );
    }
    
}