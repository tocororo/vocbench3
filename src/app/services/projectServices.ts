import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { VBContext } from '../utils/VBContext';
import { Project, AccessLevel, LockLevel, RepositoryAccess } from '../models/Project';
import { ARTURIResource } from '../models/ARTResources';
import { PluginSpecification } from '../models/Plugins';

@Injectable()
export class ProjectServices {

    private serviceName = "Projects";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the current available projects in ST
     * @return an array of Project
     */
    listProjects() {
        console.log("[ProjectServices] listProjects");
        var params = {
            consumer: "SYSTEM"
        };
        return this.httpMgr.doGet(this.serviceName, "listProjects", params).map(
            stResp => {
                var projColl = stResp.getElementsByTagName("project");
                var projectList: Project[] = [];
                for (var i = 0; i < projColl.length; i++) {
                    var proj = new Project();
                    proj.setAccessible(projColl[i].getAttribute("accessible") == "true");
                    proj.setHistoryEnabled(projColl[i].getAttribute("historyEnabled") == "true");
                    proj.setValidationEnabled(projColl[i].getAttribute("validationEnabled") == "true");
                    proj.setModelType(projColl[i].getAttribute("model"));
                    proj.setLexicalizationModelType(projColl[i].getAttribute("lexicalizationModel"));
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
        if (VBContext.getWorkingProject() != undefined && VBContext.getWorkingProject().getName() == project.getName()) {
            VBContext.removeWorkingProject();
        }

        var params = {
            consumer: "SYSTEM",
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "disconnectFromProject", params).map(
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
        return this.httpMgr.doGet(this.serviceName, "accessProject", params);
    }

    /**
     * @param projectName
     * @param modelType
     * @param baseURI
     * @param historyEnabled
     * @param validationEnabled
     * @param uriGeneratorSpecification
     * @param renderingEngineSpecification
     */
    createProject(projectName: string, baseURI: string, model: ARTURIResource, lexicalizationModel: ARTURIResource,
        historyEnabled: boolean, validationEnabled: boolean, repositoryAccess: RepositoryAccess,
        coreRepoID: string, supportRepoID: string,
        coreRepoSailConfigurerSpecification?: PluginSpecification, supportRepoSailConfigurerSpecification?: PluginSpecification,
        uriGeneratorSpecification?: PluginSpecification, renderingEngineSpecification?: PluginSpecification,
        creationDateProperty?: ARTURIResource, modificationDateProperty?: ARTURIResource) {
        
        console.log("[ProjectServices] createProject");
        var params: any = {
            consumer: "SYSTEM",
            projectName: projectName,
            baseURI: baseURI,
            model: model,
            lexicalizationModel: lexicalizationModel,
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
        if (creationDateProperty != undefined) {
            params.creationDateProperty = creationDateProperty;
        }
        if (modificationDateProperty != undefined) {
            params.modificationDateProperty = modificationDateProperty;
        }
        return this.httpMgr.doPost("Projects2", "createProject", params, true);
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
        return this.httpMgr.doGet(this.serviceName, "deleteProject", params);
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
        return this.httpMgr.uploadFile(this.serviceName, "importProject", data);
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
        return this.httpMgr.downloadFile(this.serviceName, "exportProject", params);
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
        return this.httpMgr.doGet(this.serviceName, "saveProject", params);
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
        return this.httpMgr.doGet(this.serviceName, "getProjectPropertyMap", params).map(
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
    getAccessStatusMap(): Observable<{name: string, consumers: {name: string, availableACLLevel: AccessLevel, acquiredACLLevel: AccessLevel}[], lock: any}[]> {
        console.log("[ProjectServices] getAccessStatusMap");
        var params = { };
        return this.httpMgr.doGet(this.serviceName, "getAccessStatusMap", params).map(
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
        return this.httpMgr.doGet(this.serviceName, "updateAccessLevel", params);
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
            lockLevel: lockLevel,
        };
        return this.httpMgr.doGet(this.serviceName, "updateLockLevel", params);
    }

}