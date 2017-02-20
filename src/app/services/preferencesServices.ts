import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager } from "../utils/HttpManager";
import { PropertyLevel } from "../models/Preferences";

@Injectable()
export class PreferencesServices {

    private serviceName = "Preferences";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Gets the rendering languages preference
     * @param level tells at which level to get the property
     * @return a list of language tag. If the list has just one element "*", it means "all languages"
     */
    getLanguages(level: PropertyLevel): Observable<string[]> {
        console.log("[PreferencesServices] getLanguages");
        var params = {
            level: level
        };
        return this.httpMgr.doGet(this.serviceName, "getLanguages", params, this.oldTypeService, true);
    }

    /**
     * Sets the rendering languages preference
     * @param languages list of languages, list with just one element "*" in order to set "all languages"
     * @param level tells at which level to set the property
     */
    setLanguages(languages: string[], level: PropertyLevel) {
        console.log("[PreferencesServices] setLanguages");
        var params = {
            languages: languages,
            level: level
        };
        return this.httpMgr.doGet(this.serviceName, "setLanguages", params, this.oldTypeService, true);
    }

}