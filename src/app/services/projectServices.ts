import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTLiteral, ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { TransitiveImportMethodAllowance } from '../models/Metadata';
import { PluginSpecification, Settings } from '../models/Plugins';
import { AccessLevel, AccessStatus, BackendTypesEnum, ConsumerACL, ExceptionDAO, LockLevel, LockStatus, PreloadedDataSummary, Project, RepositoryAccess, RepositorySummary } from '../models/Project';
import { Multimap, Pair } from '../models/Shared';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { VBContext } from '../utils/VBContext';
import { VBEventHandler } from '../utils/VBEventHandler';
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { ModalType } from '../widget/modal/Modals';

@Injectable()
export class ProjectServices {

    private serviceName = "Projects";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

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
        let params: any = {
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
        return this.httpMgr.doGet(this.serviceName, "listProjects", params).pipe(
            map(stResp => {
                let projCollJson: any[] = stResp;
                let projectList: Project[] = [];
                for (let i = 0; i < projCollJson.length; i++) {
                    projectList.push(Project.deserialize(projCollJson[i]));
                }
                //sort by name
                projectList.sort((p1, p2) => p1.getName().toLocaleLowerCase().localeCompare(p2.getName().toLocaleLowerCase()));
                return projectList;
            })
        );
    }

    retrieveProjects(bagOf?: string, orQueryList?: {[key: string]: any}[][], userDependent?: boolean, onlyOpen?: boolean): Observable<Multimap<Project>> {
        let params = {
            bagOf: bagOf,
            orQueryList: orQueryList ? JSON.stringify(orQueryList) : null,
            userDependent: userDependent,
            onlyOpen: onlyOpen
        };
        return this.httpMgr.doPost(this.serviceName, "retrieveProjects", params).pipe(
            map(stResp => {
                let bagOfProjects: Multimap<Project> = {};
                for (let bagName of Object.keys(stResp)) {
                    let projList: Project[] = [];
                    for (let pJson of stResp[bagName]) {
                        projList.push(Project.deserialize(pJson));
                    }
                    projList.sort((p1, p2) => p1.getName().toLocaleLowerCase().localeCompare(p2.getName().toLocaleLowerCase()));
                    bagOfProjects[bagName] = projList;
                }
                return bagOfProjects;
            })
        );
    }

    getProjectInfo(projectName: string, consumer?: Project, requestedAccessLevel?: AccessLevel, requestedLockLevel?: LockLevel): Observable<Project> {
        let params: any = {
            projectName: projectName,
            consumer: consumer != null ? consumer.getName() : "SYSTEM",
            requestedAccessLevel: requestedAccessLevel,
            requestedLockLevel: requestedLockLevel
        }
        return this.httpMgr.doGet(this.serviceName, "getProjectInfo", params).pipe(
            map(stResp => {
                return Project.deserialize(stResp);
            })
        );
    }
        

    /**
     * Accesses to the given project
     * @param project the project to access
     */
    accessProject(project: Project) {
        let params = {
            consumer: "SYSTEM",
            projectName: project.getName(),
            requestedAccessLevel: "RW",
            requestedLockLevel: "NO"
        };
        let options: VBRequestOptions = new VBRequestOptions({
            errorAlertOpt: { 
                show: true, 
                exceptionsToSkip: ['it.uniroma2.art.semanticturkey.exceptions.ProjectAccessException'] 
            } 
        });
        return this.httpMgr.doPost(this.serviceName, "accessProject", params, options);
    }

    accessAllProjects(consumer?: Project, requestedAccessLevel?: AccessLevel, requestedLockLevel?: LockLevel, onlyProjectsAtStartup?: boolean): Observable<{[key: string]: ExceptionDAO }> {
        let params = {
            consumer: consumer != null ? consumer.getName() : null,
            requestedAccessLevel: requestedAccessLevel,
            requestedLockLevel: requestedLockLevel,
            onlyProjectsAtStartup: onlyProjectsAtStartup
        };
        return this.httpMgr.doPost(this.serviceName, "accessAllProjects", params);
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
            this.eventHandler.themeChangedEvent.emit(); //when quitting current project, reset the style to the default
        }

        let params = {
            consumer: "SYSTEM",
            projectName: project.getName()
        };
        return this.httpMgr.doPost(this.serviceName, "disconnectFromProject", params).pipe(
            map(stResp => {
                return stResp;
            })
        );
    }

    disconnectFromAllProjects(consumer?: Project) {
        let params = {
            consumer: consumer != null ? consumer.getName() : null,
        };
        return this.httpMgr.doPost(this.serviceName, "disconnectFromAllProjects", params).pipe(
            map(() => {
                if (VBContext.getWorkingProject() != undefined) {
                    VBContext.removeWorkingProject();
                    this.eventHandler.themeChangedEvent.emit(); //when quitting current project, reset the style to the default
                }
            })
        );
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
        preloadedDataFileName?: string, preloadedDataFormat?: string, transitiveImportAllowance?: TransitiveImportMethodAllowance,
        openAtStartup?: boolean, globallyAccessible?: boolean, label?: ARTLiteral) {
        
        let params: any = {
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
            resourceMetadataAssociations: (resourceMetadataAssociations) ? JSON.stringify(resourceMetadataAssociations.map(p => [p.first, p.second])) : null,
            shaclEnabled: shaclEnabled,
            shaclSettings: shaclSettings,
            trivialInferenceEnabled: trivialInferenceEnabled,
            preloadedDataFileName: preloadedDataFileName,
            preloadedDataFormat: preloadedDataFormat,
            transitiveImportAllowance: transitiveImportAllowance,
            openAtStartup: openAtStartup,
            globallyAccessible: globallyAccessible,
            label: label
        };
        let options: VBRequestOptions = new VBRequestOptions({
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
        let params = {
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
        let data = {
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
        let params = {
            projectName: project.getName()
        };
        return this.httpMgr.downloadFile(this.serviceName, "exportProject", params, true);
    }

    /**
     * Returns a map of pairs name-value of the project's properties
     * @param project 
     */
    getProjectPropertyMap(project: Project): Observable<{name: string, value: string}[]> {
        let params = {
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectPropertyMap", params).pipe(
            map(stResp => {
                let propCollJson: any[] = stResp;
                let propertyList: Array<any> = [];
                for (let i = 0; i < propCollJson.length; i++) {
                    let prop: any = {};
                    prop.name = propCollJson[i].name;
                    prop.value = propCollJson[i].value;
                    propertyList.push(prop);
                }
                return propertyList;
            })
        );
    }

    /**
     * 
     */
    getAccessStatusMap(): Observable<AccessStatus[]> {
        let params = { };
        return this.httpMgr.doGet(this.serviceName, "getAccessStatusMap", params).pipe(
            map(stResp => {
                let aclMap: AccessStatus[] = [];
                let projectJsonColl: any[] = stResp;
                projectJsonColl.forEach(projAclJson => {
                    aclMap.push(this.parseAccessStatus(projAclJson));
                })
                return aclMap;
            })
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
        return this.httpMgr.doGet(this.serviceName, "getAccessStatus", params).pipe(
            map(stResp => {
                return this.parseAccessStatus(stResp);
            })
        );
    }

    private parseAccessStatus(projAclJson: any): AccessStatus {
        let name = projAclJson.name;
        //consumers node
        let consumers: ConsumerACL[] = [];
        let consumersJsonColl: any[] = projAclJson.consumers;
        for (let j = 0; j < consumersJsonColl.length; j++) {
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
        let universalACLLevel: AccessLevel = projAclJson.universalACLLevel;
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
        return { name: name, consumers: consumers, lock: projectLock, universalACLLevel: universalACLLevel };
    }

    /**
     * Grants the given access level from the accessed project to the consumer. 
     * If the accessLevel is not provided, revokes any access level assigned from the project to the consumer
     * @param consumer 
     * @param accessLevel
     */
    updateAccessLevel(consumer: Project, accessLevel?: AccessLevel) {
        let params: any = {
            consumerName: consumer.getName(),
            accessLevel: accessLevel
        };
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
        let params: any = {
            projectName: project.getName(),
            consumerName: consumer.getName(),
            accessLevel: accessLevel
        };
        return this.httpMgr.doPost(this.serviceName, "updateProjectAccessLevel", params);
    }

    /**
     * Grants the given access level from the accessed project to every consumer. 
     * If the accessLevel is not provided, revokes any universal access level assigned from the project
     * @param accessLevel
     */
    updateUniversalAccessLevel(accessLevel?: AccessLevel) {
        let params: any = {
            accessLevel: accessLevel
        }
        return this.httpMgr.doPost(this.serviceName, "updateUniversalAccessLevel", params);
    }

    /**
     * Grants the given access level from the given project to every consumer. 
     * If the accessLevel is not provided, revokes any universal access level assigned to the given project
     * @param project 
     * @param consumer 
     * @param accessLevel
     */
    updateUniversalProjectAccessLevel(project: Project, accessLevel?: AccessLevel) {
        let params: any = {
            projectName: project.getName(),
            accessLevel: accessLevel
        };
        return this.httpMgr.doPost(this.serviceName, "updateUniversalProjectAccessLevel", params);
    }

    /**
     * 
     * @param project 
     * @param accessLevel 
     */
    updateProjectLockLevel(project: Project, lockLevel: LockLevel) {
        let params = {
            projectName: project.getName(),
            lockLevel: lockLevel,
        };
        return this.httpMgr.doPost(this.serviceName, "updateProjectLockLevel", params);
    }

    /**
     * 
     * @param project 
     * @param accessLevel 
     */
    updateLockLevel(lockLevel: LockLevel) {
        let params = {
            lockLevel: lockLevel,
        };
        return this.httpMgr.doPost(this.serviceName, "updateLockLevel", params);
    }

    /**
     * Method useful to handle the exception about missing st-changetracking-sail.jar in the triple store.
     * This Exception could be thrown by two services: accessProject() and createProject().
     * @param error 
     * @param basicModals 
     */
    public handleMissingChangetrackierSailError(error: Error, basicModals: BasicModalServices) {
        if (error.name.endsWith("ProjectAccessException") || error.name.endsWith("RepositoryException")) {
            let msg = error.message;
            let errMsgPattern = "\.*Unsupported Sail type: (\.+)";
            let msgMatch = msg.match(errMsgPattern);
            if (msgMatch != null) {
                let sailMap: {[key:string]: { feature: string, jar: string }} = {
                    ["http://semanticturkey.uniroma2.it/sail/trivialinferencer"]: { feature: "Trivial Inference", jar: "st-trivial-inference-sail.jar" },
                    ["http://semanticturkey.uniroma2.it/sail/changetracker"]: { feature: "History and Validation", jar: "st-changetracking-sail.jar" },
                }
                let missingSailUrl = msgMatch[1];
                let missingSail = sailMap[missingSailUrl];
                let message = "The sail required for the " + missingSail.feature + " feature " + 
                    "is reported to be missing from the triple store; please contact the administrator in order to " + 
                    "have the " + missingSail.jar + " bundle deployed within the triple store connected for this project";
                basicModals.alert({key:"STATUS.ERROR"}, message, ModalType.error, error.name + ": " + error.message);
            } else {
                let errorMsg = error.message != null ? error.message : "Unknown response from the server";
                let errorDetails = error.stack ? error.stack : error.name;
                basicModals.alert({key:"STATUS.ERROR"}, errorMsg, ModalType.error, errorDetails);
            }
        }
    }


    /**
     * 
     * @param project 
     * @param excludeLocal 
     */
    getRepositories(project: Project, excludeLocal?: boolean): Observable<RepositorySummary[]> {
        let params: any = {
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
        let params: any = {
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
        let params: any = {
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
        return this.httpMgr.uploadFile(this.serviceName, "preloadDataFromFile", params).pipe(
            map(stResp => {
                return PreloadedDataSummary.parse(stResp);
            })
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
        return this.httpMgr.doPost(this.serviceName, "preloadDataFromURL", params).pipe(
            map(stResp => {
                return PreloadedDataSummary.parse(stResp);
            })
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
        return this.httpMgr.doPost(this.serviceName, "preloadDataFromCatalog", params).pipe(
            map(stResp => {
                return PreloadedDataSummary.parse(stResp);
            })
        );
    }

    /**
     * 
     */
    createEmptySHACLSettingsForm(): Observable<Settings> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "createEmptySHACLSettingsForm", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    /**
     * 
     * @param project 
     * @param propName 
     * @param propValue 
     */
    setProjectProperty(project: Project, propName: string, propValue: string) {
        let params = {
            projectName: project.getName(),
            propName: propName,
            propValue: propValue
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectProperty", params);
    }

    //==== FACETS SERVICES

    /**
     * Sets the facets of a project
     * 
     * @param project
     * @param facets
     */
    setProjectFacets(project: Project, facets: Settings) {
        let params = {
            projectName: project.getName(),
            facets: JSON.stringify(facets.getPropertiesAsMap())
        }
        return this.httpMgr.doPost(this.serviceName, "setProjectFacets", params);
    }

    /**
     * Gets the schema of project facets
     * 
     */
    getCustomProjectFacetsSchema(): Observable<Settings> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getCustomProjectFacetsSchema", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    /**
     * Sets  the schema of project facets
     * 
     */
    setCustomProjectFacetsSchema(facetsSchema: Settings) {
        let params = {
            facetsSchema: JSON.stringify(facetsSchema.getPropertiesAsMap())
        };
        return this.httpMgr.doPost(this.serviceName, "setCustomProjectFacetsSchema", params);
    }

    getProjectFacetsForm(): Observable<Settings> {
        let params = {}
        return this.httpMgr.doGet(this.serviceName, "getProjectFacetsForm", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    getProjectFacets(projectName: string) {
        let params = {
            projectName: projectName
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectFacets", params);
    }

    createFacetIndex() {
        let params = {};
        return this.httpMgr.doPost(this.serviceName, "createFacetIndex", params);
    }

    recreateFacetIndexForProject(projectName: string) {
        let params = {
            projectName: projectName
        };
        return this.httpMgr.doPost(this.serviceName, "recreateFacetIndexForProject", params);
    }

    getFacetsAndValue(): Observable<Multimap<string>> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getFacetsAndValue", params);
    }

    /**
     * Enables/disables blacklisting in a <em>closed</em> project with <em>validation</em> already enabled
     * 
     * @param projectName 
     * @param projectName 
     */
    setBlacklistingEnabled(projectName: string, blacklistingEnabled: boolean) {
        let params = {
            projectName: projectName,
            blacklistingEnabled: blacklistingEnabled
        };
        return this.httpMgr.doPost(this.serviceName, "setBlacklistingEnabled", params);
    }

    getURIGeneratorConfiguration(projectName: string): Observable<{ factoryID: string, settings: Settings }> {
        let params = {
            projectName: projectName
        };
        return this.httpMgr.doGet(this.serviceName, "getURIGeneratorConfiguration", params).pipe(
            map(stResp => {
                let config = {
                    factoryID: stResp[0],
                    settings: Settings.parse(stResp[1])
                }
                return config;
            })
        );
    }

    updateURIGeneratorConfiguration(projectName: string, uriGeneratorSpecification: PluginSpecification) {
        let params = {
            projectName: projectName,
            uriGeneratorSpecification: JSON.stringify(uriGeneratorSpecification)
        };
        return this.httpMgr.doPost(this.serviceName, "updateURIGeneratorConfiguration", params);
    }

    getRenderingEngineConfiguration(projectName: string): Observable<{ factoryID: string, settings: Settings }> {
        let params = {
            projectName: projectName
        };
        return this.httpMgr.doGet(this.serviceName, "getRenderingEngineConfiguration", params).pipe(
            map(stResp => {
                let config = {
                    factoryID: stResp[0],
                    settings: Settings.parse(stResp[1])
                }
                return config;
            })
        );
    }

    updateRenderingEngineConfiguration(projectName: string, renderingEngineSpecification: PluginSpecification) {
        let params = {
            projectName: projectName,
            renderingEngineSpecification: JSON.stringify(renderingEngineSpecification)
        };
        return this.httpMgr.doPost(this.serviceName, "updateRenderingEngineConfiguration", params);
    }

    getOpenAtStartup(projectName: string) {
        let params = {
            projectName: projectName
        };
        return this.httpMgr.doGet(this.serviceName, "getOpenAtStartup", params);
    }

    setOpenAtStartup(projectName: string, openAtStartup: boolean) {
        let params = {
            projectName: projectName,
            openAtStartup: openAtStartup
        };
        return this.httpMgr.doPost(this.serviceName, "setOpenAtStartup", params);
    }

    setProjectLabels(project: Project, labels: {[key: string]: string}) {
        let params = {
            projectName: project.getName(),
            labels: JSON.stringify(labels)
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectLabels", params);
    }

}