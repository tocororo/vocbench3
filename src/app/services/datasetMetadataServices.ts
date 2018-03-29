import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { PluginSpecification, Settings, SettingsProp } from "../models/Plugins";
import { RDFFormat } from "../models/RDFFormat";

@Injectable()
export class DatasetMetadataServices {

    private serviceName = "DatasetMetadata";

    constructor(private httpMgr: HttpManager) { }

    /**
     * @param exporterId
     */
    getDatasetMetadata(exporterId: string): Observable<{extensionPointSettings: Settings, pluginSettings: Settings}> {
        console.log("[DatasetMetadataExportServices] getDatasetMetadata");
        var params = {
            exporterId: exporterId
        };
        return this.httpMgr.doGet(this.serviceName, "getDatasetMetadata", params).map(
            stResp => {
                let extPointSettingsJson = stResp.extensionPointSettings;
                let extensionPointSettings: Settings = Settings.parse(extPointSettingsJson);

                let pluginSettingsJson = stResp.pluginSettings;
                let pluginSettings: Settings = Settings.parse(pluginSettingsJson);

                return { extensionPointSettings: extensionPointSettings, pluginSettings: pluginSettings };
            }
        );
    }

    /**
     * @param exporterId
     * @param extensionPointProperties json map object of key - value
     * @param pluginProperties json map object of key - value
     */
    setDatasetMetadata(exporterId: string, extensionPointProperties: any, pluginProperties: any) {
        console.log("[DatasetMetadataExportServices] setDatasetMetadata");
        var params = {
            exporterId: exporterId,
            extensionPointProperties: JSON.stringify(extensionPointProperties),
            pluginProperties: JSON.stringify(pluginProperties)
        };
        return this.httpMgr.doPost(this.serviceName, "setDatasetMetadata", params);
    }

    /**
     * @param exporterSpecification
     * @param outputFormat
     */
    export(exporterSpecification: PluginSpecification, outputFormat?: RDFFormat) {
        console.log("[DatasetMetadataExportServices] export");
        var params = {
            exporterSpecification: JSON.stringify(exporterSpecification),
            outputFormat: outputFormat.name
        };
        return this.httpMgr.downloadFile(this.serviceName, "export", params, true);
    }


}