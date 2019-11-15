import { Observable } from "rxjs/Observable";
import { Project } from "../models/Project";
import { MetadataServices } from "../services/metadataServices";
import { UserServices } from "../services/userServices";
import { DatatypeValidator } from "../utils/DatatypeValidator";
import { VBCollaboration } from "../utils/VBCollaboration";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";

export abstract class AbstractProjectComponent {

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

}