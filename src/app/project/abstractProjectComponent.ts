import { Directive } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from "rxjs";
import { Project, ProjectViewMode } from "../models/Project";
import { MetadataServices } from "../services/metadataServices";
import { ProjectServices } from '../services/projectServices';
import { UserServices } from "../services/userServices";
import { Cookie } from "../utils/Cookie";
import { DatatypeValidator } from "../utils/DatatypeValidator";
import { VBCollaboration } from "../utils/VBCollaboration";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { ModalOptions } from '../widget/modal/Modals';
import { ProjectTableConfigModal } from './projectTableConfig/projectTableConfigModal';

@Directive()
export abstract class AbstractProjectComponent {

    ProjectViewMode = ProjectViewMode;
    visualizationMode: ProjectViewMode;
    protected projectList: Project[];
    protected projectDirs: ProjectDirEntry[];

    protected projectService: ProjectServices;
    protected userService: UserServices;
    protected metadataService: MetadataServices;
    protected vbCollaboration: VBCollaboration;
    protected vbProp: VBProperties;
    protected dtValidator: DatatypeValidator;
    protected modalService: NgbModal;
    constructor(projectService: ProjectServices, userService: UserServices, metadataService: MetadataServices, 
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator, modalService: NgbModal) {
        this.projectService = projectService;
        this.userService = userService;
        this.metadataService = metadataService;
        this.vbCollaboration = vbCollaboration;
        this.vbProp = vbProp;
        this.dtValidator = dtValidator;
        this.modalService = modalService;
    }

    ngOnInit() {
        this.initProjects();
    }

    initProjects() {
        //init visualization mode
        this.visualizationMode = ProjectViewMode.list; //default
        let viewModeCookie: string = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        if (viewModeCookie in ProjectViewMode) {
            this.visualizationMode = <ProjectViewMode>viewModeCookie;
        }

        if (this.visualizationMode == ProjectViewMode.list) {
            //init project list
            this.projectService.listProjects().subscribe(
                projectList => {
                    this.projectList = projectList;
                }
            );
        } else { //facets based
            this.initProjectDirectories();
        }
    }

    abstract initProjectList(): void;

    protected initProjectDirectories(): void {
        let bagOfFacet = Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);
        this.projectService.retrieveProjects(bagOfFacet).subscribe(
            projectBags => {
                this.projectDirs = [];
                Object.keys(projectBags).forEach(bag => {
                    let dirEntry = new ProjectDirEntry(bag);
                    dirEntry.projects = projectBags[bag];
                    this.projectDirs.push(dirEntry);
                });
                this.projectDirs.sort((d1: ProjectDirEntry, d2: ProjectDirEntry) => {
                    if (d1.dir == null || d1.dir == "") return 1;
                    else if (d2.dir == null || d2.dir == "") return -1;
                    else return d1.dir.localeCompare(d2.dir);
                });
                //TODO handle open/close directory
            }
        )
    }

    protected accessProject(project: Project) {
        VBContext.setWorkingProject(project);
        VBContext.setProjectChanged(true);

        return forkJoin([
            this.vbProp.initProjectUserBindings(VBContext.getWorkingProjectCtx()), //init PUBinding
            this.vbProp.initUserProjectPreferences(VBContext.getWorkingProjectCtx()), //init the project preferences
            this.vbProp.initProjectSettings(VBContext.getWorkingProjectCtx()), //init the project settings
            this.vbCollaboration.initCollaborationSystem(), //init Collaboration System
            this.userService.listUserCapabilities(), //get the capabilities for the user
            this.metadataService.getNamespaceMappings(), //get default namespace of the project and set it to the vbContext
            this.dtValidator.initDatatypeRestrictions(), //initializes the mappings datatype-facets for the validation of typed literal
        ]);
    }

    protected isWorkingProject(project: Project): boolean {
        var workingProj = VBContext.getWorkingProject();
        return (workingProj != undefined && workingProj.getName() == project.getName());
    }

    protected toggleDirectory(projectDir: ProjectDirEntry) {
        projectDir.open = !projectDir.open
        //update collapsed directories cookie
        this.storeCollpasedDirectoriesCookie();
    }

    protected storeCollpasedDirectoriesCookie() {
        let collapsedDirs: string[] = [];
        this.projectDirs.forEach(pd => {
            if (!pd.open) {
                let dirNameValue = pd.dir != null ? pd.dir : "null";
                collapsedDirs.push(dirNameValue);
            }
        })
        Cookie.setCookie(Cookie.PROJECT_COLLAPSED_DIRS, collapsedDirs.join(","));
    }

    protected retrieveCollapsedDirectoriesCookie(): string[] {
        let collapsedDirs: string[] = [];
        let collapsedDirsCookie: string = Cookie.getCookie(Cookie.PROJECT_COLLAPSED_DIRS)
        if (collapsedDirsCookie != null) {
            collapsedDirs = collapsedDirsCookie.split(",");
        }
        collapsedDirs.forEach((dir, index, list) => { //replace the serialized "null" directory with the null value
            if (dir == "null") list[index] = null;
        });
        return collapsedDirs;
    }

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(ProjectTableConfigModal, new ModalOptions('sm'));
        modalRef.result.then(
            () => { //changed settings
                this.initProjects();
            },
            () => {} //nothing changed
        );
    }

}

export class ProjectDirEntry {
    dir: string;
    open: boolean;
    projects: Project[];
    constructor(dir: string) {
        this.dir = dir;
        this.open = true;
        this.projects = [];
    }
}