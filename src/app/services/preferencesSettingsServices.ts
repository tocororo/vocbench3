import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from "../models/ARTResources";
import { Project } from "../models/Project";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";

@Injectable()
export class PreferencesSettingsServices {

    private serviceName = "PreferencesSettings";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Sets the rendering languages preference
     * @param languages list of languages, list with just one element "*" in order to set "all languages"
     * @param level tells at which level to set the property
     */
    setLanguages(languages: string[]) {
        console.log("[PreferencesServices] setLanguages");
        var params = {
            languages: languages
        };
        return this.httpMgr.doPost(this.serviceName, "setLanguages", params, true);
    }

    /**
     * Sets the show_flag preference
     * @param show 
     */
    setShowFlags(show: boolean) {
        console.log("[PreferencesServices] setShowFlags");
        var params = {
            show: show
        };
        return this.httpMgr.doPost(this.serviceName, "setShowFlags", params, true);
    }

    /**
     * Sets the show_instances_number preference
     * @param show 
     */
    setShowInstancesNumb(show: boolean) {
        console.log("[PreferencesServices] setShowInstancesNumb");
        var params = {
            show: show
        };
        return this.httpMgr.doPost(this.serviceName, "setShowInstancesNumb", params, true);
    }

    /**
     * Sets the default active skos concept schemes
     * @param scheme s
     */
    setActiveSchemes(schemes?: ARTURIResource[]) {
        console.log("[PreferencesServices] setActiveSchemes");
        var params: any = {}
        if (schemes != null) {
            params.schemes = schemes;
        }
        return this.httpMgr.doPost(this.serviceName, "setActiveSchemes", params, true);
    }

    /**
     * 
     * @param themeId 
     */
    setProjectTheme(themeId: number) {
        console.log("[PreferencesServices] setProjectTheme");
        var params: any = {
            themeId: themeId
        }
        return this.httpMgr.doPost(this.serviceName, "setProjectTheme", params, true);
    }

    /**
     * Returns the active schemes for the given project
     * @param projectName 
     */
    getActiveSchemes(projectName: string): Observable<ARTURIResource[]> {
        console.log("[PreferencesServices] getActiveSchemes");
        var params: any = {
            projectName: projectName
        }
        return this.httpMgr.doGet(this.serviceName, "getActiveSchemes", params, true).map(
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
    getProjectPreferences() {
        console.log("[PreferencesServices] getProjectPreferences");
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getProjectPreferences", params, true);
    }

    /**
     * Gets the settings for the currently open project
     * @param properties 
     * @param project 
     */
    getProjectSettings(properties: string[], project?: Project) {
        console.log("[PreferencesServices] getProjectSettings");
        var params: any = {
            properties: properties
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "getProjectSettings", params, true);
    }

    /**
     * @param property 
     * @param project 
     */
    setProjectSetting(property: string, value?: string, project?: Project) {
        console.log("[PreferencesServices] setProjectSetting");
        var params: any = {
            property: property,
        };
        if (value != null) {
            params.value = value;
        }
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doPost(this.serviceName, "setProjectSetting", params, true);
    }

    /**
     * Gets the default project settings
     * @param properties 
     */
    getDefaultProjectSettings(properties: string[]) {
        console.log("[PreferencesServices] getDefaultProjectSettings");
        var params = {
            properties: properties
        };
        return this.httpMgr.doGet(this.serviceName, "getDefaultProjectSettings", params, true);
    }

}