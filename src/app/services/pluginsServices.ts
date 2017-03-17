import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {Plugin, PluginConfiguration, PluginConfigParam} from "../models/Plugins";

@Injectable()
export class PluginsServices {

    private serviceName = "Plugins";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }
    
    /**
     * Gets the plugin factories available for the given extPoint
     * @param extensionPoint the id of the requested extensionPoint
     */
    getAvailablePlugins(extensionPoint: string): Observable<Plugin[]> {
        console.log("[PluginsServices] getAvailablePlugins");
        var params = {
            extensionPoint: extensionPoint
        };
        return this.httpMgr.doGet(this.serviceName, "getAvailablePlugins", params, this.oldTypeService).map(
            stResp => {
                var pluginColl = stResp.getElementsByTagName("plugin");
                var plugins: Plugin[] = [];
                for (var j = 0; j < pluginColl.length; j++) {
                    var pluginId = pluginColl[j].getAttribute("factoryID");
                    plugins.push(new Plugin(pluginId));
                }
                //sort plugins by factoryID
                plugins.sort(
                    function(a: Plugin, b: Plugin) {
                        if (a.factoryID < b.factoryID) return -1;
                        if (a.factoryID > b.factoryID) return 1;
                        return 0;
                    }
                );
                return plugins;
            }
        );
    }
    
    /**
     * Gets the configuration available for the given plugin factory.
     * Returns an array of configuration structures {shortName, editRequired, type, params} 
     * where params is in turn an array of struct {description, name, required, value}
     * @param factoryID the factory class of the plugin
     */
    getPluginConfigurations(factoryID: string): Observable<{factoryID: string, configurations: PluginConfiguration[]}> {
        console.log("[PluginsServices] getPluginConfigurations");
        var params = {
            factoryID: factoryID
        };
        return this.httpMgr.doGet(this.serviceName, "getPluginConfigurations", params, this.oldTypeService).map(
            stResp => {
                var configurations: PluginConfiguration[] = [];
                var configColl = stResp.getElementsByTagName("configuration");
                for (var i = 0; i < configColl.length; i++) {
                    let shortName = configColl[i].getAttribute("shortName");
                    let editRequired = configColl[i].getAttribute("editRequired") == "true";
                    let type = configColl[i].getAttribute("type");
                    
                    var params: PluginConfigParam[] = [];
                    var parColl = configColl[i].getElementsByTagName("par");
                    for (var j = 0; j < parColl.length; j++) {
                        let description = parColl[j].getAttribute("description");
                        let name = parColl[j].getAttribute("name");
                        let required = parColl[j].getAttribute("required") == "true";
                        let value = parColl[j].textContent;
                        params.push(new PluginConfigParam(name, description, required, value));
                    }
                    configurations.push(new PluginConfiguration(shortName, type, editRequired, params));
                }
                return {factoryID: factoryID, configurations: configurations};
            }
        );
    }

}