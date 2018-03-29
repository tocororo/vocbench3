import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpManager, VBRequestOptions } from "../utils/HttpManager";
import { Scope, ExtensionFactory, Settings } from '../models/Plugins';

@Injectable()
export class ExtensionsServices {

    private serviceName = "Extensions";

    constructor(private httpMgr: HttpManager) { }

    getExtensionPoints(scopes?: Scope) {
        console.log("[ExtensionsServices] getExtensionPoints");
        var params: any = {};
        if (scopes != null) {
            params.scopes = scopes;
        }
        return this.httpMgr.doGet(this.serviceName, "getExtensionPoints", params)
    }

    getExtensionPoint(identifier: string) {
        console.log("[ExtensionsServices] getExtensionPoint");
        var params: any = {
            identifier: identifier
        };
        return this.httpMgr.doGet(this.serviceName, "getExtensionPoint", params)
    }

    getExtensions(extensionPointID: string): Observable<ExtensionFactory[]> {
        console.log("[ExtensionsServices] getExtensions");
        var params: any = {
            extensionPointID: extensionPointID
        };
        return this.httpMgr.doGet(this.serviceName, "getExtensions", params).map(
            stResp => {
                let exts: ExtensionFactory[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let configurations: Settings[] = [];
                    let configColl: any[] = stResp[i].configurations;
                    if (configColl != null) {
                        for (var j = 0; j < configColl.length; j++) {
                            configurations.push(Settings.parse(configColl[j]));
                        }
                    }
                    let extFact: ExtensionFactory = new ExtensionFactory(stResp[i].id, stResp[i].name, stResp[i].description, 
                        stResp[i].extensionType, stResp[i].scope, stResp[i].configurationScopes, configurations);
                    exts.push(extFact);
                }
                return exts;
            }
        );
    }

}