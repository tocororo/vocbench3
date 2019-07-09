import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable"
import { AdministrationServices } from "../services/administrationServices";
import { UserServices } from "../services/userServices";
import { MetadataServices } from "../services/metadataServices";
import { Project } from "../models/Project";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";
import { VBCollaboration } from "../utils/VBCollaboration";

@Component({
    selector: "abstract-project-component",
    template: "",
})
export abstract class AbstractProjectComponent {

    protected adminService: AdministrationServices;
    protected userService: UserServices;
    protected metadataService: MetadataServices;
    protected vbCollaboration: VBCollaboration;
    protected vbProp: VBProperties;
    constructor(adminService: AdministrationServices, userService: UserServices, metadataService: MetadataServices, 
        vbCollaboration: VBCollaboration, vbProp: VBProperties) {
        this.adminService = adminService;
        this.userService = userService;
        this.metadataService = metadataService;
        this.vbCollaboration = vbCollaboration;
        this.vbProp = vbProp;
    }

    protected accessProject(project: Project) {
        VBContext.setWorkingProject(project);
        VBContext.setProjectChanged(true);

        let initPUBinding = this.adminService.getProjectUserBinding(project.getName(), VBContext.getLoggedUser().getEmail()).map(
            puBinding => {
                VBContext.setProjectUserBinding(puBinding);
            }
        );
        
        return Observable.forkJoin(
            initPUBinding, //init PUBinding
            this.vbProp.initUserProjectPreferences(VBContext.getWorkingProjectCtx()), //init the project preferences
            this.vbProp.initProjectSettings(VBContext.getWorkingProjectCtx()), //init the project settings
            this.vbCollaboration.initCollaborationSystem(), //init Collaboration System
            this.userService.listUserCapabilities(), //get the capabilities for the user
            this.metadataService.getNamespaceMappings() //get default namespace of the project and set it to the vbContext
        );
    }

    protected isWorkingProject(project: Project): boolean {
        var workingProj = VBContext.getWorkingProject();
        return (workingProj != undefined && workingProj.getName() == project.getName());
    }

}