import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { Scope, ExtensionFactory, Settings, ConfigurableExtensionFactory, NonConfigurableExtensionFactory } from '../models/Plugins';

@Injectable()
export class GraphServices {

    private serviceName = "Graph";

    constructor(private httpMgr: HttpManager) { }

    getGraphModel() {
        console.log("[GraphServices] getGraphModel");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getGraphModel", params);
    }

}