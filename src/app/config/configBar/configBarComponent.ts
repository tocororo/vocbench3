import {Component} from "@angular/core";
import {Router} from "@angular/router";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {Project, ProjectTypesEnum} from "../../utils/Project";
import {InputOutputServices} from "../../services/inputOutputServices";
import {ProjectServices} from "../../services/projectServices";
import {RefactorServices} from "../../services/refactorServices";
import {ModalServices} from "../../widget/modal/modalServices";

@Component({
	selector: "config-bar",
	templateUrl: "./configBarComponent.html",
})
export class ConfigBarComponent {
    
    private currentProject: Project;
    
    constructor(private inOutService: InputOutputServices, private projectService: ProjectServices,
        private refactorService: RefactorServices, private vbCtx: VocbenchCtx, 
        private modalService: ModalServices, private router: Router) {}
    
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
        return this.vbCtx.isLoggedIn();
    }
    
    private clearData() {
        this.modalService.confirm("Clear data", "This operation will erase all the data stored in the project." +
                " The project will be closed and then you will be redirect to the projects page." +
                " Are you sure to proceed?", "warning").then(
            result => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.inOutService.clearData().subscribe(
                    stResp => {
                        this.modalService.alert("Clear data", "All data cleared successfully!");
                        //if project is not-persistent save it before closing
                        if (this.vbCtx.getWorkingProject().getType() == ProjectTypesEnum.saveToStore) {
                            this.projectService.saveProject(this.vbCtx.getWorkingProject()).subscribe(
                                stResp => {
                                    //then close project
                                    this.projectService.disconnectFromProject(this.vbCtx.getWorkingProject()).subscribe(
                                        stResp => {
                                            document.getElementById("blockDivFullScreen").style.display = "none";
                                            //then redirect to home page
                                            this.router.navigate(['/Projects']);
                                        },
                                        err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                                    );
                                },
                                err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                            )
                        } else {
                            //project is presistent, it doesn't need to be saved, just close the project
                            this.projectService.disconnectFromProject(this.vbCtx.getWorkingProject()).subscribe(
                                stResp => {
                                    document.getElementById("blockDivFullScreen").style.display = "none";
                                    //then redirect to home page
                                    this.router.navigate(['/Projects']);
                                },
                                err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                            );
                        }
                    },
                    err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                );
            },
            () => {}
        );
    }
    
    private migrateData() {
        this.modalService.confirm("Migrate data", "This operation will move the content of the default " 
                + "graph to a graph named after the base URI of the current project. It also will clear "
                + "the default graph and preserve the information already contained in the "
                + "destination graph. Once the operation is done, you will be redirect to the project page. "
                + "Are you sure to continue?", "warning").then(
            confirm => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.refactorService.migrateDefaultGraphToBaseURIGraph().subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        //then redirect to home page
                        this.router.navigate(['/Projects']);
                    },
                    err => { document.getElementById("blockDivFullScreen").style.display = "none"; }
                );
            },
            () => {}
        )
    }
    
}