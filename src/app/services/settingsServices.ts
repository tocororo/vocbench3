import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtensionPoint, Scope, Settings } from '../models/Plugins';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";

@Injectable()
export class SettingsServices {

    private serviceName = "Settings";

    constructor(private httpMgr: HttpManager) { }

    getSettingManagers(): Observable<ExtensionPoint[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getSettingManagers", params).pipe(
            map(stResp => {
                let extPts: ExtensionPoint[] = [];
                for (let epJson of stResp) {
                    extPts.push(ExtensionPoint.parse(epJson));
                }
                return extPts;
            })
        );
    }

    /**
     * 
     * @param componentID 
     */
    getSettingsScopes(componentID: string) {
        let params = {
            componentID: componentID
        };
        return this.httpMgr.doGet(this.serviceName, "getSettingsScopes", params);
    }

    /**
     * 
     * @param componentID 
     * @param scope 
     */
    getSettings(componentID: string, scope: Scope, options?: VBRequestOptions): Observable<Settings> {
        let params = {
            componentID: componentID,
            scope: scope
        };
        return this.httpMgr.doGet(this.serviceName, "getSettings", params, options).pipe(
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
        let params = {
            componentID: componentID,
            scope: scope,
            settings: JSON.stringify(settings)
        };
        return this.httpMgr.doPost(this.serviceName, "storeSettings", params);
    }

}