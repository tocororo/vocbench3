import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { TransitiveImportMethodAllowance } from '../models/Metadata';
import { PluginSpecification, Settings } from '../models/Plugins';
import { AccessLevel, AccessStatus, BackendTypesEnum, ConsumerACL, LockLevel, LockStatus, PreloadedDataSummary, Project, RepositoryAccess, RepositorySummary } from '../models/Project';
import { Pair } from '../models/Shared';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { VBContext } from '../utils/VBContext';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';

@Injectable()
export class ProjectServices {

    private serviceName = "Projects";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the current available projects in ST
     * @param consumer
	 * @param requestedAccessLevel
	 * @param requestedLockLevel
	 * @param userDependent if true, returns only the projects accessible by the logged user 
	 * 		(the user has a role assigned in it)
	 * @param onlyOpen if true, return only the open projects
     * @return an array of Project
     */
    listProjects(consumer?: Project, userDependent?: boolean, onlyOpen?: boolean): Observable<Project[]> {
        var params: any = {
            consumer: "SYSTEM"
        };
        if (consumer != undefined) { //if consumer provided override the default (SYSTEM)
            params.consumer = consumer.getName();
        };
        if (userDependent != null) {
            params.userDependent = userDependent;
        }
        if (onlyOpen != null) {
            params.onlyOpen = onlyOpen;
        }
        return this.httpMgr.doGet(this.serviceName, "listProjects", params).map(
            stResp => {
                var projCollJson: any[] = stResp;
                var projectList: Project[] = [];
                for (var i = 0; i < projCollJson.length; i++) {
                    projectList.push(Project.deserialize(projCollJson[i]));
                }
                //sort by name
                projectList.sort(
                    function (p1: Project, p2: Project) {
                        return p1.getName().toLowerCase().localeCompare(p2.getName().toLowerCase());
                    }
                )
                return projectList;
            }
        );
    }

    getProjectInfo(projectName: string, consumer?: Project, requestedAccessLevel?: AccessLevel, requestedLockLevel?: LockLevel): Observable<Project> {
        var params: any = {
            projectName: projectName,
            consumer: consumer != null ? consumer.getName() : "SYSTEM",
            requestedAccessLevel: requestedAccessLevel,
            requestedLockLevel: requestedLockLevel
        }
        return this.httpMgr.doGet(this.serviceName, "getProjectInfo", params).map(
            stResp => {
                return Project.deserialize(stResp);
            }
        );
    }
        

    /**
     * Disconnects from the given project.
     * @param project the project to disconnect
     */
    disconnectFromProject(project: Project) {

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
        return this.httpMgr.doPost(this.serviceName, "disconnectFromProject", params).map(
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
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
            requestedAccessLevel: "RW",
            requestedLockLevel: "NO"
        };
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['it.uniroma2.art.semanticturkey.exceptions.ProjectAccessException'] 
            } 
        });
        return this.httpMgr.doPost(this.serviceName, "accessProject", params, options);
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
        historyEnabled: boolean, validationEnabled: boolean, blacklistingEnabled: boolean, repositoryAccess: RepositoryAccess,
        coreRepoID: string, supportRepoID: string,
        coreRepoSailConfigurerSpecification?: PluginSpecification, coreBackendType?: BackendTypesEnum,
        supportRepoSailConfigurerSpecification?: PluginSpecification, supportBackendType?: BackendTypesEnum,
        leftDataset?: string, rightDataset?: string,
        uriGeneratorSpecification?: PluginSpecification, renderingEngineSpecification?: PluginSpecification,
        resourceMetadataAssociations?: Pair<RDFResourceRolesEnum, string>[],
        shaclEnabled?: boolean, shaclSettings?: Map<string, any>, trivialInferenceEnabled?: boolean,
        preloadedDataFileName?: string, preloadedDataFormat?: string, transitiveImportAllowance?: TransitiveImportMethodAllowance) {
        
        var params: any = {
            consumer: "SYSTEM",
            projectName: projectName,
            baseURI: baseURI,
            model: model,
            lexicalizationModel: lexicalizationModel,
            historyEnabled: historyEnabled,
            validationEnabled: validationEnabled,
            blacklistingEnabled: blacklistingEnabled,
            repositoryAccess: repositoryAccess.stringify(),
            coreRepoID: coreRepoID,
            supportRepoID: supportRepoID,
            coreRepoSailConfigurerSpecification: (coreRepoSailConfigurerSpecification) ? JSON.stringify(coreRepoSailConfigurerSpecification) : null,
            coreBackendType: coreBackendType,
            supportRepoSailConfigurerSpecification: (supportRepoSailConfigurerSpecification) ? JSON.stringify(supportRepoSailConfigurerSpecification) : null,
            supportBackendType: supportBackendType,
            leftDataset: leftDataset, 
            rightDataset: rightDataset,
            uriGeneratorSpecification: (uriGeneratorSpecification) ? JSON.stringify(uriGeneratorSpecification) : null,
            renderingEngineSpecification: (renderingEngineSpecification) ? JSON.stringify(renderingEngineSpecification) : null,
            resourceMetadataAssociations: JSON.stringify(resourceMetadataAssociations.map(p => [p.first, p.second])),
            shaclEnabled: shaclEnabled,
            shaclSettings: shaclSettings,
            trivialInferenceEnabled: trivialInferenceEnabled,
            preloadedDataFileName: preloadedDataFileName,
            preloadedDataFormat: preloadedDataFormat,
            transitiveImportAllowance: transitiveImportAllowance,
        };
        var options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['it.uniroma2.art.semanticturkey.exceptions.ProjectAccessException', 'org.eclipse.rdf4j.repository.RepositoryException'] 
            } 
        });
        return this.httpMgr.doPost(this.serviceName, "createProject", params, options);
    }

    /**
     * Deletes the given project
     * @param project the project to delete
     */
    deleteProject(project: Project) {
        var params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
        };
        return this.httpMgr.doPost(this.serviceName, "deleteProject", params);
    }

    /**
     * Imports a project archieve previously exported
     * @param projectName the name of the new project
     * @param projectFile the archieve of the project to import
     */
    importProject(projectName: string, projectFile: File) {
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
        var params = {
            projectName: project.getName()
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportProject", params, true);
    }

    /**
     * Returns a map of pairs name-value of the project's properties
     * @param project 
     */
    getProjectPropertyMap(project: Project): Observable<{name: string, value: string}[]> {
        var params = {
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectPropertyMap", params).map(
            stResp => {
                var propCollJson: any[] = stResp;
                var propertyList: Array<any> = [];
                for (var i = 0; i < propCollJson.length; i++) {
                    var prop: any = {};
                    prop.name = propCollJson[i].name;
                    prop.value = propCollJson[i].value;
                    propertyList.push(prop);
                }
                return propertyList;
            }
        );
    }

    /**
     * 
     */
    getAccessStatusMap(): Observable<AccessStatus[]> {
        var params = { };
        return this.httpMgr.doGet(this.serviceName, "getAccessStatusMap", params).map(
            stResp => {
                var aclMap: AccessStatus[] = [];
                var projectJsonColl: any[] = stResp;
                projectJsonColl.forEach(projAclJson => {
                    aclMap.push(this.parseAccessStatus(projAclJson));
                })
                return aclMap;
            }
        );
    }

    /**
     * 
     * @param projectName 
     */
    getAccessStatus(projectName: string): Observable<AccessStatus> {
        let params = {
            projectName: projectName
        };
        return this.httpMgr.doGet(this.serviceName, "getAccessStatus", params).map(
            stResp => {
                return this.parseAccessStatus(stResp);
            }
        );
    }

    private parseAccessStatus(projAclJson: any): AccessStatus {
        let name = projAclJson.name;
        //consumers node
        let consumers: ConsumerACL[] = [];
        let consumersJsonColl: any[] = projAclJson.consumers;
        for (var j = 0; j < consumersJsonColl.length; j++) {
            let consumer: ConsumerACL = {
                name: consumersJsonColl[j].name,
                availableACLLevel: null,
                acquiredACLLevel: null
            };
            if (consumersJsonColl[j].availableACLLevel != null) {
                consumer.availableACLLevel = <AccessLevel> consumersJsonColl[j].availableACLLevel;
            }
            if (consumersJsonColl[j].acquiredACLLevel != null) {
                consumer.acquiredACLLevel = <AccessLevel> consumersJsonColl[j].acquiredACLLevel;
            }
            consumers.push(consumer);
        }
        //lock node
        let lockNode = projAclJson.lock;
        let projectLock: LockStatus = {
            availableLockLevel: <LockLevel> lockNode.availableLockLevel,
            lockingConsumer: null,
            acquiredLockLevel: null
        }
        if (lockNode.lockingConsumer != null && lockNode.acquiredLockLevel != null) {
            projectLock.lockingConsumer = lockNode.lockingConsumer;
            projectLock.acquiredLockLevel = lockNode.acquiredLockLevel;
        }
        return { name: name, consumers: consumers, lock: projectLock };
    }

    /**
     * Grants the given access level from the accessed project to the consumer. 
     * If the accessLevel is not provided, revokes any access level assigned from the project to the consumer
     * @param consumer 
     * @param accessLevel
     */
    updateAccessLevel(consumer: Project, accessLevel?: AccessLevel) {
        var params: any = {
            consumerName: consumer.getName(),
        };
        if (accessLevel != null) {
            params.accessLevel = accessLevel;
        }
        return this.httpMgr.doPost(this.serviceName, "updateAccessLevel", params);
    }

    /**
     * Grants the given access level from the given project to the consumer. 
     * If the accessLevel is not provided, revokes any access level assigned from the project to the consumer
     * @param project 
     * @param consumer 
     * @param accessLevel
     */
    updateProjectAccessLevel(project: Project, consumer: Project, accessLevel?: AccessLevel) {
        var params: any = {
            projectName: project.getName(),
            consumerName: consumer.getName(),
        };
        if (accessLevel != null) {
            params.accessLevel = accessLevel;
        }
        return this.httpMgr.doPost(this.serviceName, "updateProjectAccessLevel", params);
    }

    /**
     * 
     * @param project 
     * @param accessLevel 
     */
    updateLockLevel(lockLevel: LockLevel) {
        var params = {
            lockLevel: lockLevel,
        };
        return this.httpMgr.doPost(this.serviceName, "updateLockLevel", params);
    }

    /**
     * 
     * @param project 
     * @param accessLevel 
     */
    updateProjectLockLevel(project: Project, lockLevel: LockLevel) {
        var params = {
            projectName: project.getName(),
            lockLevel: lockLevel,
        };
        return this.httpMgr.doPost(this.serviceName, "updateProjectLockLevel", params);
    }

    /**
     * Method useful to handle the exception about missing st-changetracking-sail.jar in the triple store.
     * This Exception could be thrown by two services: accessProject() and createProject().
     * @param error 
     * @param basicModals 
     */
    public handleMissingChangetrackierSailError(error: Error, basicModals: BasicModalServices) {
        if (error.name.endsWith("ProjectAccessException") || error.name.endsWith("RepositoryException")) {
            if (error.message.includes("Unsupported Sail type: http://semanticturkey.uniroma2.it/sail/changetracker")) {
                let message = "The changetracker sail, required for history and validation, " + 
                    "is reported to be missing from the triple store; please contact the administrator in order to " + 
                    "have the st-changetracking-sail.jar bundle deployed within the triple store connected for this project";
                basicModals.alert("Error", message, "error", error.name + ": " + error.message);
            } else {
                let errorMsg = error.message != null ? error.message : "Unknown response from the server";
                let errorDetails = error.stack ? error.stack : error.name;
                basicModals.alert("Error", errorMsg, "error", errorDetails);
            }
        }
    }


    /**
     * 
     * @param project 
     * @param excludeLocal 
     */
    getRepositories(project: Project, excludeLocal?: boolean): Observable<RepositorySummary[]> {
        var params: any = {
            projectName: project.getName()
        };
        if (excludeLocal != null) {
            params.excludeLocal = excludeLocal;
        }
        return this.httpMgr.doGet(this.serviceName, "getRepositories", params);
    }

    /**
     * 
     * @param project 
     * @param repositoryID 
     * @param newUsername 
     * @param newPassword 
     */
    modifyRepositoryAccessCredentials(project: Project, repositoryID: string, newUsername?: string, newPassword?: string) {
        var params: any = {
            projectName: project.getName(),
            repositoryID: repositoryID,
        };
        if (newUsername != null) {
            params.newUsername = newUsername;
        }
        if (newPassword != null) {
            params.newPassword = newPassword;
        }
        return this.httpMgr.doPost(this.serviceName, "modifyRepositoryAccessCredentials", params);
    }
    
    /**
     * 
     * @param project 
     * @param serverURL 
     * @param matchUsername 
     * @param currentUsername 
     * @param newUsername 
     * @param newPassword 
     */
    batchModifyRepostoryAccessCredentials(project: Project, serverURL: string, matchUsername?: boolean, 
        currentUsername?: string, newUsername?: string, newPassword?: string) {
        var params: any = {
            projectName: project.getName(),
            serverURL: serverURL,
        };
        if (matchUsername != null) {
            params.matchUsername = matchUsername;
        }
        if (currentUsername != null) {
            params.currentUsername = currentUsername;
        }
        if (newUsername != null) {
            params.newUsername = newUsername;
        }
        if (newPassword != null) {
            params.newPassword = newPassword;
        }
        return this.httpMgr.doPost(this.serviceName, "batchModifyRepostoryAccessCredentials", params);
    }

    /**
     * 
     * @param preloadedData 
     * @param preloadedDataFormat 
     */
    preloadDataFromFile(preloadedData: File, preloadedDataFormat: string): Observable<PreloadedDataSummary> {
        let params: any = {
            preloadedData: preloadedData,
            preloadedDataFormat: preloadedDataFormat,
        };
        return this.httpMgr.uploadFile(this.serviceName, "preloadDataFromFile", params).map(
            stResp => {
                return PreloadedDataSummary.parse(stResp);
            }
        );
    }

    /**
     * 
     * @param preloadedDataURL 
     * @param preloadedDataFormat 
     */
    preloadDataFromURL(preloadedDataURL: string, preloadedDataFormat?: string): Observable<PreloadedDataSummary> {
        let params: any = {
            preloadedDataURL: preloadedDataURL,
            preloadedDataFormat: preloadedDataFormat,
        };
        return this.httpMgr.doPost(this.serviceName, "preloadDataFromURL", params).map(
            stResp => {
                return PreloadedDataSummary.parse(stResp);
            }
        );
    }

    /**
     * 
     * @param connectorId 
     * @param datasetId 
     */
    preloadDataFromCatalog(connectorId: string, datasetId: string): Observable<PreloadedDataSummary> {
        let params: any = {
            connectorId: connectorId,
            datasetId: datasetId,
        };
        return this.httpMgr.doPost(this.serviceName, "preloadDataFromCatalog", params).map(
            stResp => {
                return PreloadedDataSummary.parse(stResp);
            }
        );
    }

    /**
     * 
     */
    createEmptySHACLSettingsForm(): Observable<Settings> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "createEmptySHACLSettingsForm", params).map(
            stResp => {
                return Settings.parse(stResp);
            }
        );
    }

    /**
     * 
     * @param projectName 
     * @param facetValue 
     */
    setProjectFacetDir(projectName: string, facetValue?: string) {
        let params: any = {
            projectName: projectName,
            facetValue: facetValue
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectFacetDir", params);
    }

    /**
     * 
     * @param oldValue 
     * @param newValue 
     */
    renameProjectFacetDir(oldValue: string, newValue: string) {
        let params: any = {
            oldValue: oldValue,
            newValue: newValue
        };
        return this.httpMgr.doPost(this.serviceName, "renameProjectFacetDir", params);
    }

    /**
     * 
     * @param dirName 
     */
    deleteProjectDir(dirName: string) {
        let params: any = {
            dirName: dirName,
        };
        return this.httpMgr.doPost(this.serviceName, "deleteProjectDir", params);
    }

    /**
     * 
     * @param project 
     * @param propName 
     * @param propValue 
     */
    setProjectProperty(project: Project, propName: string, propValue: string) {
        var params = {
            projectName: project.getName(),
            propName: propName,
            propValue: propValue
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectProperty", params);
    }

}