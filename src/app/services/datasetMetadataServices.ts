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