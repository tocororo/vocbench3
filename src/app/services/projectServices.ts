import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { VocbenchCtx } from '../utils/VocbenchCtx';
import { Project, AccessLevel, LockLevel, RepositoryAccess } from '../models/Project';
import { PluginSpecification } from '../models/Plugins';

@Injectable()
export class ProjectServices {

    private serviceName = "Projects";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private vbCtx: VocbenchCtx) { }

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
     * Disconnects from the given project.
     * @param project the project to disconnect
     */
    disconnectFromProject(project: Project) {
        console.log("[ProjectServices] disconnectFromProject");

        //if the closing project is the working, remove it from context
        //this could be a temporary warkaround to avoid the problem described here https://art-uniroma2.atlassian.net/browse/ST-289
        //but is not a "perfect" solution, since it remove the working project from the ctx before it is effectively closed
        if (this.vbCtx.getWorkingProject() != undefined && this.vbCtx.getWorkingProject().getName() == project.getName()) {
            this.vbCtx.removeWorkingProject();
        }

        var params = {
            consumer: "SYSTEM",
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "disconnectFromProject", params, this.oldTypeService).map(
            stResp => {
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
    // createProject(projectName: string, modelType: string, baseURI: string,
    //     ontManagerFactoryID: string, modelConfigurationClass: string, modelConfigurationArray: Array<any>,
    //     uriGeneratorFactoryID?: string, uriGenConfigurationClass?: string, uriGenConfigurationArray?: Array<any>,
    //     renderingEngineFactoryID?: string, renderingEngineConfigurationClass?: string, renderingEngineConfigurationArray?: Array<any>) {

    //     console.log("[ProjectServices] createProject");
    //     var params: any = {
    //         consumer: "SYSTEM",
    //         projectName: projectName,
    //         modelType: modelType,
    //         baseURI: baseURI,
    //         ontManagerFactoryID: ontManagerFactoryID,
    //         modelConfigurationClass: modelConfigurationClass,
    //         modelConfiguration: modelConfigurationArray.map(arrElem => arrElem.name + "=" + arrElem.value).join("\n"),
    //     };

    //     if (uriGeneratorFactoryID != undefined && uriGenConfigurationClass != undefined && uriGenConfigurationArray != undefined) {
    //         params.uriGeneratorFactoryID = uriGeneratorFactoryID;
    //         params.uriGenConfigurationClass = uriGenConfigurationClass;
    //         params.uriGenConfiguration = uriGenConfigurationArray.map(arrElem => arrElem.name + "=" + arrElem.value).join("\n");
    //     }

    //     if (renderingEngineFactoryID != undefined && uriGenConfigurationClass != undefined && uriGenConfigurationArray != undefined) {
    //         params.renderingEngineFactoryID = renderingEngineFactoryID;
    //         params.renderingEngineConfigurationClass = renderingEngineConfigurationClass;
    //         params.renderingEngineConfiguration = renderingEngineConfigurationArray.map(arrElem => arrElem.name + "=" + arrElem.value).join("\n");
    //     }

    //     return this.httpMgr.doGet(this.serviceName, "createProject", params, this.oldTypeService);
    // }

    /**
     * @param projectName
     * @param modelType
     * @param baseURI
     * @param historyEnabled
     * @param validationEnabled
     * @param uriGeneratorSpecification
     * @param renderingEngineSpecification
     */
    createProject(projectName: string, modelType: string, baseURI: string,
        historyEnabled: boolean, validationEnabled: boolean, repositoryAccess: RepositoryAccess,
        coreRepoID: string, supportRepoID: string,
        coreRepoSailConfigurerSpecification?: PluginSpecification, supportRepoSailConfigurerSpecification?: PluginSpecification,
        uriGeneratorSpecification?: PluginSpecification, renderingEngineSpecification?: PluginSpecification) {
        
        console.log("[ProjectServices] createProject");
        var params: any = {
            consumer: "SYSTEM",
            projectName: projectName,
            modelType: modelType,
            baseURI: baseURI,
            historyEnabled: historyEnabled,
            validationEnabled: validationEnabled,
            repositoryAccess: repositoryAccess.stringify(),
            coreRepoID: coreRepoID,
            supportRepoID: supportRepoID
        };
        if (coreRepoSailConfigurerSpecification != undefined) {
            params.coreRepoSailConfigurerSpecification = JSON.stringify(coreRepoSailConfigurerSpecification);
        }
        if (supportRepoSailConfigurerSpecification != undefined) {
            params.supportRepoSailConfigurerSpecification = JSON.stringify(supportRepoSailConfigurerSpecification);
        }
        if (uriGeneratorSpecification != undefined) {
            params.uriGeneratorSpecification = JSON.stringify(uriGeneratorSpecification);
        }
        if (renderingEngineSpecification != undefined) {
            params.renderingEngineSpecification = JSON.stringify(renderingEngineSpecification);
        }
        return this.httpMgr.doPost("Projects2", "createProject", params, this.oldTypeService, true);
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
        return this.httpMgr.doGet(this.serviceName, "saveProject", params, this.oldTypeService);
    }

    /**
     * Returns a map of pairs name-value of the project's properties
     * @param project 
     */
    getProjectPropertyMap(project: Project): Observable<any[]> {
        console.log("[ProjectServices] getProjectPropertyMap");
        var params = {
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectPropertyMap", params, this.oldTypeService).map(
            stResp => {
                var propertyList: Array<any> = [];
                var propertyElemColl: HTMLCollection = stResp.getElementsByTagName("property");
                for (var i = 0; i < propertyElemColl.length; i++) {
                    var prop: any = {};
                    prop.name = propertyElemColl[i].getAttribute("name");
                    prop.value = propertyElemColl[i].getAttribute("value");
                    propertyList.push(prop);
                }
                return propertyList;
            }
        );
    }

    /**
     * 
     */
    getAccessStatusMap() {
        console.log("[ProjectServices] getAccessStatusMap");
        var params = { };
        return this.httpMgr.doGet(this.serviceName, "getAccessStatusMap", params, this.oldTypeService).map(
            stResp => {
                var aclMap: {name: string, consumers: any[], lock: any}[] = [];

                var projectElemColl: NodeListOf<Element> = stResp.getElementsByTagName("project");
                for (var i = 0; i < projectElemColl.length; i++) {

                    let name = projectElemColl[i].getAttribute("name");
                    
                    //<consumer> elements
                    let consumers: {name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel}[] = [];

                    let consumerElemColl: NodeListOf<Element> = projectElemColl[i].getElementsByTagName("consumer");
                    for (var j = 0; j < consumerElemColl.length; j++) {
                        let consumer: {name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel};
                        consumer = {
                            name: consumerElemColl[j].getAttribute("name"),
                            availableACLLevel: <AccessLevel> consumerElemColl[j].getAttribute("availableACLLevel"),
                            acquiredACLLevel: <AccessLevel> consumerElemColl[j].getAttribute("acquiredACLLevel")
                        }
                        consumers.push(consumer);
                    }
                    //<lock> element
                    let projectLock: {availableLockLevel: LockLevel, lockingConsumer: string, acquiredLockLevel: LockLevel};

                    let lockElem: Element = projectElemColl[i].getElementsByTagName("lock")[0];
                    projectLock = {
                        availableLockLevel: <LockLevel> lockElem.getAttribute("availableLockLevel"),
                        lockingConsumer: lockElem.getAttribute("lockingConsumer"),
                        acquiredLockLevel: <LockLevel> lockElem.getAttribute("acquiredLockLevel")
                    };

                    aclMap.push({
                        name: name,
                        consumers: consumers,
                        lock: projectLock
                    });
                }

                return aclMap;
            }
        );
    }

    /**
     * 
     * @param project 
     * @param consumer 
     * @param accessLevel 
     */
    updateAccessLevel(project: Project, consumer: Project, accessLevel: AccessLevel) {
        console.log("[ProjectServices] updateAccessLevel");
        var params = {
            projectName: project.getName(),
            consumerName: consumer.getName(),
            accessLevel: accessLevel
        };
        return this.httpMgr.doGet(this.serviceName, "updateAccessLevel", params, this.oldTypeService);
    }

    /**
     * 
     * @param project 
     * @param accessLevel 
     */
    updateLockLevel(project: Project, lockLevel: LockLevel) {
        console.log("[ProjectServices] updateLockLevel");
        var params = {
            projectName: project.getName(),
            accessLevel: lockLevel,
        };
        return this.httpMgr.doGet(this.serviceName, "updateLockLevel", params, this.oldTypeService);
    }

}