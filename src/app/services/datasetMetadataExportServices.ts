import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { PluginSpecification, PluginConfiguration, PluginConfigParam } from "../models/Plugins";
import { RDFFormat } from "../models/RDFFormat";

@Injectable()
export class DatasetMetadataExportServices {

    private serviceName = "DatasetMetadataExport";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * @param exporterId
     */
    getExporterSettings(exporterId: string): Observable<PluginConfiguration> {
        console.log("[DatasetMetadataExportServices] getExporterSettings");
        var params = {
            exporterId: exporterId
        };
        return this.httpMgr.doGet(this.serviceName, "getExporterSettings", params, this.oldTypeService).map(
            stResp => {
                let paramsJson: any[] = stResp.parameters;
                let params: PluginConfigParam[] = [];
                for (var i = 0; paramsJson.length; i++) {
                    let param: PluginConfigParam = new PluginConfigParam(
                        paramsJson[i].name, 
                        paramsJson[i].description, 
                        paramsJson[i].required
                    );
                    params.push(param);
                }
                let pluginConf = new PluginConfiguration(stResp.shortName, stResp.type, false, params);
                return pluginConf;
            }
        );
    }


    /**
     * @param exporterId
     * @param properties json map object of key - value
     */
    setExporterSettings(exporterId: string, properties: any) {
        console.log("[DatasetMetadataExportServices] setExporterSettings");
        var params = {
            exporterId: exporterId,
            properties: JSON.stringify(properties)
        };
        return this.httpMgr.doGet(this.serviceName, "setExporterSettings", params, this.oldTypeService);
    }

    /**
     * @param exporterSpecification
     * @param outputFormat
     */
    export(exporterSpecification: PluginSpecification, outputFormat?: RDFFormat) {
        console.log("[DatasetMetadataExportServices] export");
        var params = {
            exporterId: JSON.stringify(exporterSpecification),
            outputFormat: outputFormat.name
        };
        return this.httpMgr.doGet(this.serviceName, "export", params, this.oldTypeService);
    }


}