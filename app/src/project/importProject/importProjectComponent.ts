import {Component} from "angular2/core";
import {Router} from 'angular2/router';
import {ProjectServices} from "../../services/projectServices";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {ModalServices} from "../../widget/modal/modalServices";

@Component({
	selector: "import-project-component",
	templateUrl: "app/src/project/importProject/importProjectComponent.html",
    providers: [ProjectServices],
    host: { class : "pageComponent" }
})
export class ImportProjectComponent {
    
    private projectName: string;
    private fileToUpload: File;
    private submitted: boolean = false;
    
    constructor(private projectService: ProjectServices, private vbCtx: VocbenchCtx, private router: Router,
            private modalService: ModalServices) {
    }
    
    private fileChangeEvent(file: File) {
        this.fileToUpload = file;
    }
    
    private import() {
        this.submitted = true;
        if (this.projectName && this.projectName.trim() != "" && this.fileToUpload) {
            document.getElementById("blockDivFullScreen").style.display = "block";
            this.projectService.importProject(this.projectName, this.fileToUpload).subscribe(
                stResp => {
                    this.modalService.alert("Import project", "Project imported successfully").then(
                        confirm => this.router.navigate(["Projects"])
                    );
                },
                err => { },
                () => document.getElementById("blockDivFullScreen").style.display = "none"
            );
        }
    }
    
}