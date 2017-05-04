import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ProjectServices } from "../../services/projectServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "import-project-component",
    templateUrl: "./importProjectComponent.html",
    host: { class: "pageComponent" }
})
export class ImportProjectComponent {

    private projectName: string;
    private fileToUpload: File;
    private submitted: boolean = false;

    constructor(private projectService: ProjectServices, private router: Router, private basicModals: BasicModalServices) { }

    private fileChangeEvent(file: File) {
        this.fileToUpload = file;
    }

    private import() {
        this.submitted = true;
        if (this.projectName && this.projectName.trim() != "" && this.fileToUpload) {
            UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
            this.projectService.importProject(this.projectName, this.fileToUpload).subscribe(
                stResp => {
                    UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                    this.basicModals.alert("Import project", "Project imported successfully").then(
                        confirm => this.router.navigate(["/Projects"])
                    );
                },
                err => { UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen")); }
            );
        }
    }

}