import {Component} from "angular2/core";
import {Router, ROUTER_DIRECTIVES} from "angular2/router";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {InputOutputServices} from "../../services/inputOutputServices";
import {ProjectServices} from "../../services/projectServices";

@Component({
	selector: "config-bar",
	templateUrl: "app/src/config/configBar/configBarComponent.html",
    directives: [ROUTER_DIRECTIVES], //for routerLink
    providers: [InputOutputServices, ProjectServices]
})
export class ConfigBarComponent {
    
    constructor(private inOutService: InputOutputServices, private projectService: ProjectServices, 
        private vbCtx: VocbenchCtx, private router: Router) {}
    
    /**
     * returns true if a project is open. Useful to enable/disable navbar links
     */ 
    private isProjectOpen(): boolean {
        return this.vbCtx.getProject() != undefined;
    }
    
    private clearData() {
        if (confirm("This operation will erase all the data stored in the project." +
                " Then you will be redirect to the home page. Are you sure to proceed?")) {
            this.inOutService.clearData().subscribe(
                stResp => {
                    alert("All data cleared succesfully");
                    //close the project (to avoid exception)
                    this.projectService.disconnectFromProject(this.vbCtx.getProject()).subscribe(
                        stResp => {
                            //then redirect to home page
                            this.router.navigate(['Projects']);
                        },
                        err => {
                            alert("Error: " + err);
                            console.error(err['stack']);
                        });
                },
                err => {
                    document.getElementById("blockDivFullScreen").style.display = "none"
                    alert("Error: " + err);
                    console.error(err['stack']);
                });
        }        
    }
    
}