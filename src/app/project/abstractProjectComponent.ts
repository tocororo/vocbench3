import { Directive } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, Subscription } from "rxjs";
import { Project, ProjectFacets, ProjectLabelCtx, ProjectViewMode } from "../models/Project";
import { Multimap } from '../models/Shared';
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
    rendering: boolean;

    protected projectList: Project[];
    protected projectDirs: ProjectDirEntry[];

    protected projectService: ProjectServices;
    protected userService: UserServices;
    protected metadataService: MetadataServices;
    protected vbCollaboration: VBCollaboration;
    protected vbProp: VBProperties;
    protected dtValidator: DatatypeValidator;
    protected modalService: NgbModal;
    protected translateService: TranslateService;
    constructor(projectService: ProjectServices, userService: UserServices, metadataService: MetadataServices, 
        vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator, modalService: NgbModal, translateService: TranslateService) {
        this.projectService = projectService;
        this.userService = userService;
        this.metadataService = metadataService;
        this.vbCollaboration = vbCollaboration;
        this.vbProp = vbProp;
        this.dtValidator = dtValidator;
        this.modalService = modalService;
        this.translateService = translateService;
    }

    ngOnInit() {
        this.initProjects();

        this.rendering = Cookie.getCookie(Cookie.PROJECT_RENDERING) == "true";
        ProjectLabelCtx.renderingEnabled = this.rendering;
    }

    initProjects() {
        //init visualization mode
        this.visualizationMode = ProjectViewMode.list; //default
        let viewModeCookie: string = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        if (viewModeCookie in ProjectViewMode) {
            this.visualizationMode = <ProjectViewMode>viewModeCookie;
        }

        //init projects
        if (this.visualizationMode == ProjectViewMode.list) { //as list
            this.initProjectList();
        } else { //as bagOf facets based
            this.initProjectDirectories();
        }
    }

    abstract getListProjectsFn(): Observable<Project[]>;
    abstract getRetrieveProjectsBagsFn(bagOfFacet: string): Observable<Multimap<Project>>;

    private initProjectList() {
        this.getListProjectsFn().subscribe(
            projects => {
                this.projectList = projects;
            }
        )
    }

    /**
     * Retrieve projects grouped by the given facet
     * @param bagOfFacet 
     */
    private initProjectDirectories() {
        let bagOfFacet = this.getCurrentFacetBagOf();
        this.getRetrieveProjectsBagsFn(bagOfFacet).subscribe(
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
                //init open/close directory according the stored cookie
                let collapsedDirs: string[] = this.retrieveCollapsedDirectoriesCookie();
                this.projectDirs.forEach(pd => {
                    pd.open = !collapsedDirs.includes(pd.dir);
                });
                //init dir displayName (e.g.: prjLexModel and prjModel have values that can be written as RDFS, OWL, SKOS...)
                this.projectDirs.forEach(pd => pd.dirDisplayName = pd.dir); //init with the same dir as default
                let bagOfFacet = this.getCurrentFacetBagOf();
                if (bagOfFacet == ProjectFacets.prjLexModel || bagOfFacet == ProjectFacets.prjModel) {
                    this.projectDirs.forEach(pd => {
                        pd.dirDisplayName = Project.getPrettyPrintModelType(pd.dir);
                    });
                }
            }
        )
    };

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
        let workingProj = VBContext.getWorkingProject();
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
        let cds: CollapsedDirStore = {
            facet: this.getCurrentFacetBagOf(),
            dirs: collapsedDirs
        }
        Cookie.setCookie(Cookie.PROJECT_COLLAPSED_DIRS, JSON.stringify(cds));
    }

    protected retrieveCollapsedDirectoriesCookie(): string[] {
        let cds: CollapsedDirStore;
        let collapsedDirsCookie: string = Cookie.getCookie(Cookie.PROJECT_COLLAPSED_DIRS)
        if (collapsedDirsCookie != null) {
            try { //cookie might be not parsed, in case return empty list
                cds = JSON.parse(collapsedDirsCookie);
            } catch {
                return [];
            }
        }
        if (cds.facet == this.getCurrentFacetBagOf()) {
            let collapsedDirs = cds.dirs;
            collapsedDirs.forEach((dir, index, list) => { //replace the serialized "null" directory with the null value
                if (dir == "null") list[index] = null;
            });
            return collapsedDirs;
        } else {
            return [];
        }
    }

    protected getCurrentFacetBagOf() {
        return Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);
    }


    switchRendering() {
        this.rendering = !this.rendering;
        Cookie.setCookie(Cookie.PROJECT_RENDERING, this.rendering+"");
        ProjectLabelCtx.renderingEnabled = this.rendering;
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
    dirDisplayName: string;
    open: boolean;
    projects: Project[];
    constructor(dir: string) {
        this.dir = dir;
        this.open = true;
        this.projects = [];
    }
}

interface CollapsedDirStore {
    facet: string; //facet needed to check that the current facet (on which the bag-of is based) is the same of the stored cookie
    dirs: string[];
}