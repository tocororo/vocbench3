import {Component} from "@angular/core";
import {Router, RouterLink} from "@angular/router-deprecated";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {Project} from "../../utils/Project";
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
    
    private currentProject: Project;
    
    constructor(private inOutService: InputOutputServices, private projectService: ProjectServices, 
        private vbCtx: VocbenchCtx, private modalService: ModalServices, private router: Router) {}
    
    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        this.currentProject = this.vbCtx.getWorkingProject();
        return this.vbCtx.getWorkingProject() != undefined;
    }
    
    /**
     * Returns true if the user is logged (an authentication token is stored).
     */
    private isUserLogged(): boolean {
        return this.vbCtx.getAuthenticationToken() != undefined;
    }
    
    private clearData() {
        this.modalService.confirm("Clear data", "This operation will erase all the data stored in the project." +
                " Then you will be redirect to the projects page. Are you sure to proceed?", "warning").then(
            result => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.inOutService.clearData().subscribe(
                    stResp => {
                        this.modalService.alert("Clear data", "All data cleared successfully!");
                        //close the project (to avoid exception)
                        this.projectService.disconnectFromProject(this.vbCtx.getWorkingProject()).subscribe(
                            stResp => {
                                document.getElementById("blockDivFullScreen").style.display = "none";
                                this.vbCtx.removeWorkingProject();
                                //then redirect to home page
                                this.router.navigate(['Projects']);
                            },
                            err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                        );
                    },
                    err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                );
            },
            () => {}
        );
    }
    
}