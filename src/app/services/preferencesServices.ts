import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ARTURIResource } from "../models/ARTResources";
import { HttpManager } from "../utils/HttpManager";
import { Deserializer } from "../utils/Deserializer";

@Injectable()
export class PreferencesServices {

    private serviceName = "Preferences";
    private oldTypeService = false;

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
        return this.httpMgr.doGet(this.serviceName, "setLanguages", params, this.oldTypeService, true);
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
        return this.httpMgr.doGet(this.serviceName, "setShowFlags", params, this.oldTypeService, true);
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
        return this.httpMgr.doGet(this.serviceName, "setShowInstancesNumb", params, this.oldTypeService, true);
    }

    /**
     * Sets the default active skos concept scheme
     * @param scheme 
     */
    setActiveScheme(scheme?: ARTURIResource) {
        console.log("[PreferencesServices] setActiveScheme");
        var params: any = {}
        if (scheme != null) {
            params.scheme = scheme;
        }
        return this.httpMgr.doGet(this.serviceName, "setActiveScheme", params, this.oldTypeService, true);
    }

    /**
     * Returns the active scheme for the given project
     * @param projectName 
     */
    getActiveScheme(projectName: string): Observable<ARTURIResource> {
        console.log("[PreferencesServices] getActiveScheme");
        var params: any = {
            projectName: projectName
        }
        return this.httpMgr.doGet(this.serviceName, "getActiveScheme", params, this.oldTypeService, true).map(
            stResp => {
                if (stResp == null) {
                    return null;
                } else {
                    return Deserializer.createURI(stResp);
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
        return this.httpMgr.doGet(this.serviceName, "getProjectPreferences", params, this.oldTypeService, true);
    }

}