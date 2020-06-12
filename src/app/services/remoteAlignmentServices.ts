import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AlignmentOverview } from '../models/Alignment';
import { ARTURIResource } from '../models/ARTResources';
import { AlignmentPlan, MatcherDTO, ScenarioDefinition, ServiceMetadataDTO, SettingsDTO } from '../models/Maple';
import { Settings } from '../models/Plugins';
import { Project } from '../models/Project';
import { RemoteAlignmentTask } from '../models/RemoteAlignment';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class RemoteAlignmentServices {

    private serviceName = "RemoteAlignmentServices";

    constructor(private httpMgr: HttpManager) { }

    listTasks(leftDataset: Project, allowReordering: boolean, rightDataset?: Project): Observable<RemoteAlignmentTask[]> {
        var params: any = {
            leftDataset: leftDataset.getName(),
            allowReordering: allowReordering
        };
        if (rightDataset != null) {
            params.rightDataset = rightDataset.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "listTasks", params).map(
            stResp => {
                let tasks: RemoteAlignmentTask[] = [];
                stResp.forEach((result: any) => {
                    let task: RemoteAlignmentTask = {
                        id: result.id,
                        leftDataset: {
                            projectName: result.leftDataset.projectName,
                            datasetIRI: new ARTURIResource(result.leftDataset.datasetIRI),
                            baseURI: result.leftDataset.baseURI,
                            model: new ARTURIResource(result.leftDataset.model),
                            lexicalizationModel: new ARTURIResource(result.leftDataset.lexicalizationModel),
                            open: result.leftDataset.open
                        },
                        rightDataset: {
                            projectName: result.rightDataset.projectName,
                            datasetIRI: new ARTURIResource(result.rightDataset.datasetIRI),
                            baseURI: result.rightDataset.baseURI,
                            model: new ARTURIResource(result.rightDataset.model),
                            lexicalizationModel: new ARTURIResource(result.rightDataset.lexicalizationModel),
                            open: result.rightDataset.open
                        },
                        status: result.status,
                        progress: result.progress,
                        reason: result.reason,
                        startTime: result.startTime,
                        endTime: result.endTime
                    }
                    tasks.push(task);
                });
                return tasks;
            }
        )
    }

    fetchAlignment(taskId: string): Observable<AlignmentOverview> {
        var params: any = {
            taskId: taskId
        };
        return this.httpMgr.doPost(this.serviceName, "fetchAlignment", params);
    }

    /**
     * Returns the taskId
     * @param alignmentPlan 
     */
    createTask(alignmentPlan: AlignmentPlan): Observable<string> {
        var params: any = {
            alignmentPlan: JSON.stringify(alignmentPlan)
        };
        return this.httpMgr.doPost(this.serviceName, "createTask", params);
    }

    deleteTask(id: string) {
        var params: any = {
            id: id
        };
        return this.httpMgr.doPost(this.serviceName, "deleteTask", params);
    }

    downloadAlignment(taskId: string): Observable<Blob> {
        var params: any = {
            taskId: taskId
        };
        return this.httpMgr.downloadFile(this.serviceName, "downloadAlignment", params);
    }


    getServiceMetadata(): Observable<ServiceMetadataDTO> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getServiceMetadata", params).map(
            stResp => {
                let settings: SettingsDTO;
                if (stResp.settings) {
                    settings = {
                        conversionException: stResp.settings.conversionException,
                        originalSchema: stResp.settings.originalSchema,
                        stProperties: Settings.parse(stResp.settings.stProperties)
                    }
                }
                let servMetadata: ServiceMetadataDTO = {    
                    service: stResp.service,
                    specs: stResp.specs,
                    status: stResp.status,
                    version: stResp.version,
                    contact: stResp.contact,
                    documentation: stResp.documentation,
                    settings: settings
                }
                return servMetadata;
            }
        );
    }

    searchMatchers(scenarioDefinition: ScenarioDefinition): Observable<MatcherDTO[]> {
        let params: any = {
            scenarioDefinition: JSON.stringify(scenarioDefinition)
        };
        return this.httpMgr.doPost(this.serviceName, "searchMatchers", params).map(
            stResp => {
                let matchers: MatcherDTO[] = [];
                for (let matcherJson of stResp) {
                    let settings: SettingsDTO
                    if (matcherJson.settings) {
                        settings = {
                            conversionException: matcherJson.settings.conversionException,
                            originalSchema: matcherJson.settings.originalSchema,
                            stProperties: Settings.parse(matcherJson.settings.stProperties)
                        }
                    }
                    let m: MatcherDTO = {
                        description: matcherJson.description,
                        id: matcherJson.id,
                        settings: settings
                    }
                    matchers.push(m);
                }
                return matchers;
            }
        );
    }

}