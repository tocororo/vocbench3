import {Component} from "angular2/core";
import {Router} from 'angular2/router';
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
    
    private downloadLink;
    
    constructor(private inOutService: InputOutputServices, private vbCtx: VocbenchCtx, 
            private modalService: ModalServices, private router: Router) {
        //navigate to Projects view if a project is not selected
        if (vbCtx.getProject() == undefined) {
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
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err['stack']);
            },
            () => document.getElementById("blockDivFullScreen").style.display = "none"
        );
    }
    
}