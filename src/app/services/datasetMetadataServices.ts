import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PluginSpecification, Scope, Settings } from "../models/Plugins";
import { RDFFormat } from "../models/RDFFormat";
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class DatasetMetadataServices {

    private serviceName = "DatasetMetadata";

    constructor(private httpMgr: HttpManager) { }

    /**
     * @param exporterSpecification
     * @param outputFormat
     */
    export(exporterSpecification: PluginSpecification, outputFormat?: RDFFormat) {
        let params = {
            exporterSpecification: JSON.stringify(exporterSpecification),
            outputFormat: outputFormat.name
        };
        return this.httpMgr.downloadFile(this.serviceName, "export", params, true);
    }


    getMetadataVocabularySettings(componentID: string, scope: Scope): Observable<Settings> {
        let params = {
            componentID: componentID,
            scope: scope,
        };
        return this.httpMgr.doGet(this.serviceName, "getMetadataVocabularySettings", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    /**
     * 
     * @param componentID 
     * @param scope 
     * @param settings 
     */
    storeMetadataVocabularySettings(componentID: string, scope: Scope, settings: any) {
        let params = {
            componentID: componentID,
            scope: scope,
            settings: JSON.stringify(settings)
        };
        return this.httpMgr.doPost(this.serviceName, "storeMetadataVocabularySettings", params);
    }

    importMetadataVocabulariesFromMetadataRegistry(exporterSpecification: PluginSpecification, scope: Scope): Observable<Settings> {
        let params = {
            exporterSpecification: JSON.stringify(exporterSpecification),
            scope: scope,
        };
        return this.httpMgr.doGet(this.serviceName, "importMetadataVocabulariesFromMetadataRegistry", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }


}