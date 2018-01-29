import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable"
import { CollaborationServices } from "../services/collaborationServices";
import { AdministrationServices } from "../services/administrationServices";
import { UserServices } from "../services/userServices";
import { MetadataServices } from "../services/metadataServices";
import { Project } from "../models/Project";
import { CollaborationCtx } from "../models/Collaboration";
import { VBContext } from "../utils/VBContext";
import { VBProperties } from "../utils/VBProperties";

@Component({
    selector: "abstract-project-component",
    template: "",
})
export abstract class AbstractProjectComponent {

    protected adminService: AdministrationServices;
    protected userService: UserServices;
    protected metadataService: MetadataServices;
    protected collaborationService: CollaborationServices;
    protected vbProp: VBProperties;
    constructor(adminService: AdministrationServices, userService: UserServices, metadataService: MetadataServices, 
        collaborationService: CollaborationServices, vbProp: VBProperties) {
        this.adminService = adminService;
        this.userService = userService;
        this.metadataService = metadataService;
        this.collaborationService = collaborationService;
        this.vbProp = vbProp;
    }

    protected accessProject(project: Project) {
        VBContext.setWorkingProject(project);
        VBContext.setProjectChanged(true);

        //init the project preferences and settings for the project
        this.vbProp.initUserProjectPreferences();
        this.vbProp.initProjectSettings();
        //init the Project-User binding
        let initPUBinding = this.adminService.getProjectUserBinding(project.getName(), VBContext.getLoggedUser().getEmail()).map(
            puBinding => {
                VBContext.setProjectUserBinding(puBinding);
            }
        );
        
        let collCtx: CollaborationCtx = VBContext.getCollaborationCtx();
        collCtx.reset();
        let initCollSystem = this.collaborationService.getCollaborationSystemStatus(CollaborationCtx.jiraFactoryId).map(
            resp => {
                collCtx.setEnabled(resp.enabled);
                collCtx.setLinked(resp.linked);
                if (resp.preferencesConfigured && resp.settingsConfigured && resp.linked && resp.enabled) {
                    collCtx.setWorking(true);
                }
            }
        );
        
        return Observable.forkJoin(
            initPUBinding, //init PUBinding
            initCollSystem, //init Collaboration System
            this.userService.listUserCapabilities(), //get the capabilities for the user
            this.metadataService.getNamespaceMappings() //get default namespace of the project and set it to the vbContext
        );
    }

    protected isWorkingProject(project: Project): boolean {
        var workingProj = VBContext.getWorkingProject();
        return (workingProj != undefined && workingProj.getName() == project.getName());
    }

}