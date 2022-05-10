import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { Project, ProjectViewMode } from '../models/Project';
import { MetadataServices } from "../services/metadataServices";
import { ProjectServices } from "../services/projectServices";
import { UserServices } from "../services/userServices";
import { Cookie } from "../utils/Cookie";
import { DatatypeValidator } from "../utils/DatatypeValidator";
import { VBCollaboration } from '../utils/VBCollaboration';
import { VBContext } from "../utils/VBContext";
import { VBProperties } from '../utils/VBProperties';
import { AbstractProjectComponent } from "./abstractProjectComponent";

@Component({
    selector: "project-list-modal",
    templateUrl: "./projectListModal.html",
})
export class ProjectListModal extends AbstractProjectComponent {
    
    selectedProject: Project;

    isSuperUser: boolean;

    constructor(projectService: ProjectServices, userService: UserServices, metadataService: MetadataServices,
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator, modalService: NgbModal, 
        translateService: TranslateService, private activeModal: NgbActiveModal, private router: Router) {
        super(projectService, userService, metadataService, vbCollaboration, vbProp, dtValidator, modalService, translateService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.isSuperUser = VBContext.getLoggedUser().isSuperUser();
    }

    getListProjectsFn() {
        return this.projectService.listProjects(null, true, true);
    }

    getRetrieveProjectsBagsFn(bagOfFacet: string) {
        return this.projectService.retrieveProjects(bagOfFacet, null, true, true);
    }

    changeVisualizationMode(mode: ProjectViewMode) {
        this.visualizationMode = mode;
        Cookie.setCookie(Cookie.PROJECT_VIEW_MODE, mode);
    }

    createProject() {
        this.router.navigate(["/Projects/CreateProject"]);
        this.cancel();
    }

    ok() {
        this.activeModal.close();
        this.router.navigate(['/Home']).then(
            () => {
                this.accessProject(this.selectedProject).subscribe();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}