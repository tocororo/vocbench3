import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from "../models/ARTResources";
import { Project } from "../models/Project";
import { User } from '../models/User';
import { Deserializer } from "../utils/Deserializer";
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { VBContext } from '../utils/VBContext';

@Injectable()
export class PreferencesSettingsServices {

    private serviceName = "PreferencesSettings";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Sets the default active skos concept schemes
     * @param scheme s
     */
    setActiveSchemes(schemes?: ARTURIResource[], options?: VBRequestOptions) {
        var params: any = {}
        if (schemes != null) {
            params.schemes = schemes;
        }
        return this.httpMgr.doPost(this.serviceName, "setActiveSchemes", params, options);
    }

    /**
     * Returns the active schemes for the given project
     * @param projectName 
     */
    getActiveSchemes(projectName: string): Observable<ARTURIResource[]> {
        var params: any = {
            projectName: projectName
        }
        return this.httpMgr.doGet(this.serviceName, "getActiveSchemes", params).map(
            stResp => {
                if (stResp == null) {
                    return null;
                } else {
                    return Deserializer.createURIArray(stResp);
                }
            }
        );
    }

    /**
     * Gets the preferences of the currently logged user for the currently open project
     */
    getPUSettings(properties: string[], project?: Project, user?: User, pluginID?: string, options?: VBRequestOptions) {
        var params: any = {
            properties: properties,
            projectName: project != null ? project.getName() : VBContext.getWorkingProject().getName(),
            email: user != null ? user.getEmail() : VBContext.getLoggedUser().getEmail(),
            pluginID: pluginID
        }
        return this.httpMgr.doGet(this.serviceName, "getPUSettings", params, options);
    }

    /**
     * 
     * @param property 
     * @param value 
     */
    setPUSetting(property: string, value?: string, project?: Project, user?: User, pluginID?: string, options?: VBRequestOptions) {
        var params: any = {
            property: property,
            value: value,
            projectName: project != null ? project.getName() : VBContext.getWorkingProject().getName(),
            email: user != null ? user.getEmail() : VBContext.getLoggedUser().getEmail(),
            pluginID: pluginID
        };
        return this.httpMgr.doPost(this.serviceName, "setPUSetting", params, options);
    }

    /**
     * Gets the preferences of the currently logged user for the currently open project
     */
    getPGSettings(properties: string[], groupIri: ARTURIResource, project?: Project, pluginID?: string) {
        var params: any = {
            properties: properties,
            groupIri: groupIri
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        if (pluginID != null) {
            params.pluginID = pluginID
        }
        return this.httpMgr.doGet(this.serviceName, "getPGSettings", params);
    }

    /**
     * 
     * @param property 
     * @param value 
     */
    setPGSetting(property: string, groupIri: ARTURIResource, value?: string, project?: Project, pluginID?: string) {
        var params: any = {
            property: property,
            groupIri: groupIri
        };
        if (value != null) {
            params.value = value;
        }
        if (project != null) {
            params.projectName = project.getName();
        }
        if (pluginID != null) {
            params.pluginID = pluginID
        }
        return this.httpMgr.doPost(this.serviceName, "setPGSetting", params);
    }

    /**
     * Gets the settings for the currently open project
     * @param properties 
     * @param project 
     */
    getProjectSettings(properties: string[], project?: Project) {
        var params: any = {
            properties: properties
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "getProjectSettings", params);
    }

    /**
     * @param property 
     * @param project 
     */
    setProjectSetting(property: string, value?: string, project?: Project) {
        var params: any = {
            property: property,
        };
        if (value != null) {
            params.value = value;
        }
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doPost(this.serviceName, "setProjectSetting", params);
    }

    /**
     * 
     * @param properties 
     * @param email 
     * @param pluginID 
     */
    getPUSettingsUserDefault(properties: string[], email: string, pluginID?: string) {
        let params: any = {
            properties: properties,
            email: email,
            pluginID: pluginID
        };
        return this.httpMgr.doGet(this.serviceName, "getPUSettingsUserDefault", params);
    }

    /**
     * 
     * @param property 
     * @param email 
     * @param value 
     * @param pluginID 
     */
    setPUSettingUserDefault(property: string, email: string, value?: string, pluginID?: string) {
        var params: any = {
            property: property,
            email: email,
            value: value,
            pluginID: pluginID
        };
        return this.httpMgr.doPost(this.serviceName, "setPUSettingUserDefault", params);
    }

    /**
     * 
     * @param properties 
     * @param email 
     * @param pluginID 
     */
    getPUSettingsProjectDefault(properties: string[], project: Project, pluginID?: string) {
        let params: any = {
            properties: properties,
            project: project.getName(),
            pluginID: pluginID
        };
        return this.httpMgr.doGet(this.serviceName, "getPUSettingsProjectDefault", params);
    }

    /**
     * 
     * @param property 
     * @param email 
     * @param value 
     * @param pluginID 
     */
    setPUSettingProjectDefault(property: string, project: Project, value?: string, pluginID?: string) {
        var params: any = {
            property: property,
            project: project.getName(),
            value: value,
            pluginID: pluginID
        };
        return this.httpMgr.doPost(this.serviceName, "setPUSettingProjectDefault", params);
    }

    /**
     * Gets the default project settings
     * @param properties 
     */
    getDefaultProjectSettings(properties: string[]) {
        var params = {
            properties: properties
        };
        return this.httpMgr.doGet(this.serviceName, "getDefaultProjectSettings", params);
    }

    /**
     * Gets the project settings needed during system startup
     */
    getStartupSystemSettings() {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getStartupSystemSettings", params);
    }

    /**
     * 
     * @param property 
     * @param value 
     */
    setSystemSetting(property: string, value?: string) {
        var params: any = {
            property: property,
        };
        if (value != null) {
            params.value = value;
        }
        return this.httpMgr.doPost(this.serviceName, "setSystemSetting", params);
    }

    /**
     * 
     * @param properties 
     */
    getSystemSettings(properties: string[]) {
        var params = {
            properties: properties
        };
        return this.httpMgr.doGet(this.serviceName, "getSystemSettings", params);
    }

}