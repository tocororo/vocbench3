import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Project, ProjectViewMode } from '../models/Project';
import { MetadataServices } from "../services/metadataServices";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { Cookie } from "../utils/Cookie";
import { DatatypeValidator } from "../utils/DatatypeValidator";
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBProperties } from '../utils/VBProperties';
import { AbstractProjectComponent } from "./abstractProjectComponent";

@Component({
    selector: "project-list-modal",
    templateUrl: "./projectListModal.html",
})
export class ProjectListModal extends AbstractProjectComponent {
    selectedProject: Project;

    constructor(public activeModal: NgbActiveModal, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator,
        private projectService: ProjectServices, private router: Router) {
        super(userService, metadataService, vbCollaboration, vbProp, dtValidator);
    }

    initProjects() {
        //init visualization mode
        this.visualizationMode = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE) == ProjectViewMode.dir ? ProjectViewMode.dir : ProjectViewMode.list;
        
        this.projectService.listProjects(null, true, true).subscribe(
            projects => {
                this.projectList = projects;
                this.initProjectDirectories();
            }
        );
    }

    changeVisualizationMode(mode: ProjectViewMode) {
        this.visualizationMode = mode;
        Cookie.setCookie(Cookie.PROJECT_VIEW_MODE, mode);
    }

    ok() {
        this.activeModal.close();
        this.router.navigate(['/Home']).then(
            () => {
                this.accessProject(this.selectedProject).subscribe()
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}