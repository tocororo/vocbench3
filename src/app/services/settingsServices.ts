import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Scope, Settings } from '../models/Plugins';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class SettingsServices {

    private serviceName = "Settings";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     * @param componentID 
     */
    getSettingsScopes(componentID: string) {
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
        var params = {
            componentID: componentID,
            scope: scope
        };
        return this.httpMgr.doGet(this.serviceName, "getSettings", params).pipe(
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
    storeSettings(componentID: string, scope: Scope, settings: any) {
        var params = {
            componentID: componentID,
            scope: scope,
            settings: JSON.stringify(settings)
        };
        return this.httpMgr.doPost(this.serviceName, "storeSettings", params);
    }

}