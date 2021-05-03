import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtensionPoint, Scope, Settings } from '../models/Plugins';
import { Project } from '../models/Project';
import { User, UsersGroup } from '../models/User';
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

    getStartupSettings(): Observable<Settings> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getStartupSettings", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    getSettingsForProjectAdministration(componentID: string, scope: Scope, project: Project, user?: User, group?: UsersGroup) {
        let params = {
            componentID: componentID,
            scope: scope,
            projectName: project.getName(),
            userIri: user != null ? user.getIri() : null,
            groupIri: group != null ? group.iri: null,
        };
        return this.httpMgr.doGet(this.serviceName, "getSettingsForProjectAdministration", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        )
    }

    storeSettingForProjectAdministration(componentID: string, scope: Scope, propertyName: string, propertyValue: any, project: Project, user?: User, group?: UsersGroup) {
        let params = {
            componentID: componentID,
            scope: scope,
            propertyName: propertyName,
            propertyValue: JSON.stringify(propertyValue),
            projectName: project.getName(),
            userIri: user != null ? user.getIri() : null,
            groupIri: group != null ? group.iri: null,
        };
        return this.httpMgr.doPost(this.serviceName, "storeSettingForProjectAdministration", params);
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

    storePUSettingUserDefault(componentID: string, user: User, propertyName: string, propertyValue: any): Observable<void> {
        let params = {
            componentID: componentID,
            userIri: user.getIri(),
            propertyName: propertyName,
            propertyValue: JSON.stringify(propertyValue),
        };
        return this.httpMgr.doPost(this.serviceName, "storePUSettingUserDefault", params);
    }

    getPUSettingsProjectDefault(componentID: string, project: Project): Observable<Settings> {
        let params = {
            componentID: componentID,
            projectName: project.getName()
        };
        return this.httpMgr.doGet(this.serviceName, "getPUSettingsProjectDefault", params).pipe(
            map(stResp => {
                return Settings.parse(stResp);
            })
        );
    }

    storePUSettingProjectDefault(componentID: string, project: Project, propertyName: string, propertyValue: any): Observable<void> {
        let params = {
            componentID: componentID,
            projectName: project.getName(),
            propertyName: propertyName,
            propertyValue: JSON.stringify(propertyValue),
        };
        return this.httpMgr.doPost(this.serviceName, "storePUSettingProjectDefault", params);
    }

}