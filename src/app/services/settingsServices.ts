import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from "../models/ARTResources";
import { Project } from "../models/Project";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";
import { Scope, Settings } from '../models/Plugins';

@Injectable()
export class SettingsServices {

    private serviceName = "Settings";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     * @param componentID 
     */
    getSettingsScopes(componentID: string) {
        console.log("[SettingsServices] getSettingsScopes");
        var params = {
            componentID: componentID
        };
        return this.httpMgr.doGet(this.serviceName, "getSettingsScopes", params);
    }

    /**
     * 
     * @param componentID 
     * @param scope 
     */
    getSettings(componentID: string, scope: Scope): Observable<Settings> {
        console.log("[SettingsServices] getSettings");
        var params = {
            componentID: componentID,
            scope: scope
        };
        return this.httpMgr.doGet(this.serviceName, "getSettings", params).map(
            stResp => {
                return Settings.parse(stResp);
            }
        );
    }

    /**
     * 
     * @param componentID 
     * @param scope 
     * @param settings 
     */
    storeSettings(componentID: string, scope: Scope, settings: any) {
        console.log("[SettingsServices] storeSettings");
        var params = {
            componentID: componentID,
            scope: scope,
            settings: JSON.stringify(settings)
        };
        return this.httpMgr.doPost(this.serviceName, "storeSettings", params);
    }

}