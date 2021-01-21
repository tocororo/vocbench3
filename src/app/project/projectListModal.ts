import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

    constructor(projectService: ProjectServices, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator, modalService: NgbModal, 
        private activeModal: NgbActiveModal, private router: Router) {
        super(projectService, userService, metadataService, vbCollaboration, vbProp, dtValidator, modalService);
    }

    initProjectList() {
        this.projectService.listProjects(null, true, true).subscribe(
            projectList => {
                this.projectList = projectList;
            }
        );
    }

    getRetrieveProjectsBagsFn(bagOfFacet: string) {
        return this.projectService.retrieveProjects(bagOfFacet, null, true, true);
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