import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtensionPoint, Scope, Settings } from '../models/Plugins';
import { Project } from '../models/Project';
import { User } from '../models/User';
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
     * @param defaultScope 
     * @returns 
     */
    getSettingsDefault(componentID: string, scope: Scope, defaultScope?: Scope) {
        let params = {
            componentID: componentID,
            scope: scope,
            defaultScope: defaultScope,
        };
        return this.httpMgr.doGet(this.serviceName, "getSettingsDefault", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    getProjectSettings(componentID: string, project: Project): Observable<Settings> {
        let params = {
            componentID: componentID,
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "getProjectSettings", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    getPUSettingsOfUser(componentID: string, project: Project, user: User): Observable<Settings> {
        let params = {
            componentID: componentID,
            projectName: project.getName(),
            userIri: user.getIri()
        };
        return this.httpMgr.doGet(this.serviceName, "getPUSettingsOfUser", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    getPUSettingsUserDefault(componentID: string, user: User): Observable<Settings> {
        let params = {
            componentID: componentID,
            userIri: user.getIri()
        };
        return this.httpMgr.doGet(this.serviceName, "getPUSettingsUserDefault", params).pipe(
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

    /**
     * 
     * @param componentID 
     * @param scope 
     * @param defaultScope 
     * @param settings 
     * @returns 
     */
    storeSettingsDefault(componentID: string, scope: Scope, defaultScope: Scope, settings: any) {
        let params = {
            componentID: componentID,
            scope: scope,
            defaultScope: defaultScope,
            settings: JSON.stringify(settings)
        };
        return this.httpMgr.doPost(this.serviceName, "storeSettingsDefault", params);
    }

    /**
     * 
     * @param componentID 
     * @param scope 
     * @param property 
     * @param propertyValue 
     * @returns 
     */
    storeSetting(componentID: string, scope: Scope, propertyName: string, propertyValue: any, options?: VBRequestOptions) {
        let params = {
            componentID: componentID,
            scope: scope,
            propertyName: propertyName,
            propertyValue: JSON.stringify(propertyValue)
        };
        return this.httpMgr.doPost(this.serviceName, "storeSetting", params, options);
    }

    storeSettingDefault(componentID: string, scope: Scope, defaultScope: Scope, propertyName: string, propertyValue: any) {
        let params = {
            componentID: componentID,
            scope: scope,
            defaultScope: defaultScope,
            propertyName: propertyName,
            propertyValue: JSON.stringify(propertyValue)
        };
        return this.httpMgr.doPost(this.serviceName, "storeSettingDefault", params);
    }

}