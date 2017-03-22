import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class PreferencesServices {

    private serviceName = "Preferences";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the rendering languages preference
     * @return a list of language tag. If the list has just one element "*", it means "all languages"
     */
    // getLanguages(): Observable<string[]> {
    //     console.log("[PreferencesServices] getLanguages");
    //     var params = {};
    //     return this.httpMgr.doGet(this.serviceName, "getLanguages", params, this.oldTypeService, true);
    // }

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
     * Gets the show_flag preference
     */
    // getShowFlags(): Observable<boolean> {
    //     console.log("[PreferencesServices] getShowFlags");
    //     var params = {};
    //     return this.httpMgr.doGet(this.serviceName, "getShowFlags", params, this.oldTypeService, true);
    // }

    /**
     * 
     * @param show Sets the show_flag preference
     */
    setShowFlags(show: boolean) {
        console.log("[PreferencesServices] setShowFlags");
        var params = {
            show: show
        };
        return this.httpMgr.doGet(this.serviceName, "setShowFlags", params, this.oldTypeService, true);
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