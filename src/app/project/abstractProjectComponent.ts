import { Observable } from "rxjs/Observable";
import { Project, ProjectFacets, ProjectViewMode } from "../models/Project";
import { MetadataServices } from "../services/metadataServices";
import { UserServices } from "../services/userServices";
import { Cookie } from "../utils/Cookie";
import { DatatypeValidator } from "../utils/DatatypeValidator";
import { VBCollaboration } from "../utils/VBCollaboration";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";

export abstract class AbstractProjectComponent {

    protected visualizationMode: ProjectViewMode;
    protected projectList: Project[];
    protected projectDirs: ProjectDirEntry[];

    protected userService: UserServices;
    protected metadataService: MetadataServices;
    protected vbCollaboration: VBCollaboration;
    protected vbProp: VBProperties;
    protected dtValidator: DatatypeValidator;
    constructor(userService: UserServices, metadataService: MetadataServices, vbCollaboration: VBCollaboration, vbProp: VBProperties, dtValidator: DatatypeValidator) {
        this.userService = userService;
        this.metadataService = metadataService;
        this.vbCollaboration = vbCollaboration;
        this.vbProp = vbProp;
        this.dtValidator = dtValidator;
    }

    ngOnInit() {
        this.initProjects();
    }

    protected abstract initProjects(): void;

    protected initProjectDirectories(): void {
        //retrieve from cookie the directory to collapse
        let collapsedDirs: string[] = this.retrieveCollapsedDirectoriesCookie();
        //init project dirs structure
        this.projectDirs = [];
        this.projectList.forEach(p => {
            let dirName = p.getFacet(ProjectFacets.dir);
            let pEntry = this.projectDirs.find(p => p.dir == dirName);
            if (pEntry == null) {
                pEntry = new ProjectDirEntry(dirName);
                pEntry.open = !collapsedDirs.some(d => d == dirName);
                this.projectDirs.push(pEntry);
            }
            pEntry.projects.push(p);
        });
        this.projectDirs.sort((d1: ProjectDirEntry, d2: ProjectDirEntry) => {
            if (d1.dir == null) return 1;
            else if (d2.dir == null) return -1;
            else return d1.dir.localeCompare(d2.dir);
        });
    }

    protected accessProject(project: Project) {
        VBContext.setWorkingProject(project);
        VBContext.setProjectChanged(true);

        return Observable.forkJoin(
            this.vbProp.initProjectUserBindings(VBContext.getWorkingProjectCtx()), //init PUBinding
            this.vbProp.initUserProjectPreferences(VBContext.getWorkingProjectCtx()), //init the project preferences
            this.vbProp.initProjectSettings(VBContext.getWorkingProjectCtx()), //init the project settings
            this.vbCollaboration.initCollaborationSystem(), //init Collaboration System
            this.userService.listUserCapabilities(), //get the capabilities for the user
            this.metadataService.getNamespaceMappings(), //get default namespace of the project and set it to the vbContext
            this.dtValidator.initDatatypeRestrictions(), //initializes the mappings datatype-facets for the validation of typed literal
        );
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