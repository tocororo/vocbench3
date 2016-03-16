import {Component} from "angular2/core";
import {Router, RouterLink} from "angular2/router";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {InputOutputServices} from "../../services/inputOutputServices";
import {ProjectServices} from "../../services/projectServices";
import {ModalServices} from "../../widget/modal/modalServices";

@Component({
	selector: "config-bar",
	templateUrl: "app/src/config/configBar/configBarComponent.html",
    directives: [RouterLink],
    providers: [InputOutputServices, ProjectServices]
})
export class ConfigBarComponent {
    
    constructor(private inOutService: InputOutputServices, private projectService: ProjectServices, 
        private vbCtx: VocbenchCtx, private modalService: ModalServices, private router: Router) {}
    
    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        return this.vbCtx.getProject() != undefined;
    }
    
    private clearData() {
        this.modalService.confirm("Clear data", "This operation will erase all the data stored in the project." +
                " Then you will be redirect to the home page. Are you sure to proceed?", "warning").then(
            result => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.inOutService.clearData().subscribe(
                    stResp => {
                        this.modalService.alert("Clear data", "All data cleared successfully!");
                        //close the project (to avoid exception)
                        this.projectService.disconnectFromProject(this.vbCtx.getProject()).subscribe(
                            stResp => {
                                //then redirect to home page
                                this.router.navigate(['Projects']);
                            },
                            err => {
                                this.modalService.alert("Error", err, "error");
                                console.error(err['stack']);
                            });
                    },
                    err => {
                        this.modalService.alert("Error", err, "error");
                        console.error(err['stack']);
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
                );
            }
        );
    }
    
}