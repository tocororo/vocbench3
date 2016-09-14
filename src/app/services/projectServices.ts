import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {Project} from '../utils/Project';
import {VBEventHandler} from '../utils/VBEventHandler';

@Injectable()
export class ProjectServices {

    private serviceName = "Projects";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Gets the current available projects in ST
     * @return an array of Project
     */
    listProjects() {
        console.log("[ProjectServices] listProjects");
        var params = {
            consumer: "SYSTEM"
        };
        return this.httpMgr.doGet(this.serviceName, "listProjects", params, this.oldTypeService).map(
            stResp => {
                var projColl = stResp.getElementsByTagName("project");
                var projectList: Project[] = [];
                for (var i = 0; i < projColl.length; i++) {
                    var proj = new Project();
                    proj.setAccessible(projColl[i].getAttribute("accessible") == "true");
                    proj.setModelConfigType(projColl[i].getAttribute("modelConfigType"));
                    proj.setOntoMgr(projColl[i].getAttribute("ontmgr"));
                    proj.setOntoType(projColl[i].getAttribute("ontoType"));
                    proj.setOpen(projColl[i].getAttribute("open") == "true");
                    var status: any = new Object();
                    var hasIssues = projColl[i].getAttribute("status") != "ok";
                    if (hasIssues) {
                        status.class = "glyphicon glyphicon-exclamation-sign";
                        status.message = projColl[i].getAttribute("stMsg");
                    } else {
                        status.class = "glyphicon glyphicon-ok-circle";
                        status.message = projColl[i].getAttribute("status");
                    }
                    proj.setStatus(status);
                    proj.setType(projColl[i].getAttribute("type"));
                    proj.setName(projColl[i].textContent);
                    projectList.push(proj);
                }
                return projectList;
            }
        );
    }

    /**
     * Disconnects from the given project. Emits a projectClosedEvent
     * @param project the project to disconnect
     */
    disconnectFromProject(project: Project) {
        console.log("[ProjectServices] disconnectFromProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "disconnectFromProject", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.projectClosedEvent.emit(project);
                return stResp;
            }
        );
    }
    
    /**
     * Accesses to the given project
     * @param project the project to access
     */
    accessProject(project: Project) {
        console.log("[ProjectServices] accessProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
            requestedAccessLevel: "RW",
            requestedLockLevel: "NO"
        };
        return this.httpMgr.doGet(this.serviceName, "accessProject", params, this.oldTypeService);
    }
    
    /**
     * Creates a project
     * @param projectName
     * @param modelType
     * @param baseURI
     * @param ontManagerFactoryID
     * @param modelConfigurationClass
     * @param modelConfigurationArray array of param .name-.value pairs
     * @param uriGeneratorFactoryID
     * @param uriGenConfigurationClass
     * @param uriGenConfigurationArray array of param .name-.value pairs
     * @param renderingEngineFactoryID
     * @param renderingEngineConfigurationClass
     * @param renderingEngineConfigurationArray array of param .name-.value pairs
     */
    createProject(projectName: string, modelType: string, baseURI: string,
        ontManagerFactoryID: string, modelConfigurationClass: string, modelConfigurationArray: Array<any>,
        uriGeneratorFactoryID?: string, uriGenConfigurationClass?: string, uriGenConfigurationArray?: Array<any>,
		renderingEngineFactoryID?: string, renderingEngineConfigurationClass?: string, renderingEngineConfigurationArray?: Array<any>) {
            
        console.log("[ProjectServices] createProject");
        var params: any = {
            consumer: "SYSTEM",
            projectName: projectName,
            modelType: modelType,
            baseURI: baseURI,
            ontManagerFactoryID: ontManagerFactoryID,
            modelConfigurationClass: modelConfigurationClass,
            modelConfiguration: modelConfigurationArray.map(arrElem => arrElem.name + "=" + arrElem.value).join("\n"),
        };
        
        if (uriGeneratorFactoryID != undefined && uriGenConfigurationClass != undefined && uriGenConfigurationArray != undefined) {
            params.uriGeneratorFactoryID = uriGeneratorFactoryID;
            params.uriGenConfigurationClass = uriGenConfigurationClass;
            params.uriGenConfiguration = uriGenConfigurationArray.map(arrElem => arrElem.name + "=" + arrElem.value).join("\n");
        }
        
        if (renderingEngineFactoryID != undefined && uriGenConfigurationClass != undefined && uriGenConfigurationArray != undefined) {
            params.renderingEngineFactoryID = renderingEngineFactoryID;
            params.renderingEngineConfigurationClass = renderingEngineConfigurationClass;
            params.renderingEngineConfiguration = renderingEngineConfigurationArray.map(arrElem => arrElem.name + "=" + arrElem.value).join("\n");
        }
        
        return this.httpMgr.doGet(this.serviceName, "createProject", params, this.oldTypeService);
    }

    /**
     * Deletes the given project
     * @param project the project to delete
     */
    deleteProject(project: Project) {
        console.log("[ProjectServices] deleteProject");
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
        };
        return this.httpMgr.doGet(this.serviceName, "deleteProject", params, this.oldTypeService);
    }
    
    /**
     * Imports a project archieve previously exported
     * @param projectName the name of the new project
     * @param projectFile the archieve of the project to import
     */
    importProject(projectName: string, projectFile: File) {
        console.log("[ProjectServices] importProject");
        var data = {
            newProjectName: projectName,
            importPackage: projectFile
        };
        return this.httpMgr.uploadFile(this.serviceName, "importProject", data, this.oldTypeService);
    }
    
    /**
     * Exports the given project in a zip file
     * @param project the project to export
     */
    exportProject(project: Project) {
        console.log("[ProjectServices] exportProject");
        var params = {
            projectName: project.getName()
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportProject", params, this.oldTypeService);
    }
    
    /**
     * Saves the given (not persistent) project
     * @param project the project to save
     */
    saveProject(project: Project) {
        console.log("[ProjectServices] saveProject");
        var params = {
            project: project.getName()
        };
        return this.httpMgr.downloadFile(this.serviceName, "saveProject", params, this.oldTypeService);
    }

}