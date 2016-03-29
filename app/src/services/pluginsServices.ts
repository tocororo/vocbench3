import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class PluginsServices {

    private serviceName = "Plugins";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }
    
    /**
     * Gets the plugin factories available for the given extPoint. Returns a structure with
     * "extPoint" (the id of the requested extensionPoint)
     * and "plugins" (list of the plugin factories ID) 
     * @param extensionPoint the id of the requested extensionPoint
     */
    getAvailablePlugins(extensionPoint: string) {
        console.log("[PluginsServices] getAvailablePlugins");
        var params = {
            extensionPoint: extensionPoint
        };
        return this.httpMgr.doGet(this.serviceName, "getAvailablePlugins", params, this.oldTypeService).map(
            stResp => {
                var pluginColl = stResp.getElementsByTagName("plugin");
                var plugins = [];
                for (var j = 0; j < pluginColl.length; j++) {
                    var plugin = pluginColl[j].getAttribute("factoryID");
                    plugins.push(plugin);
                }
                return {extPoint: extensionPoint, plugins: plugins};
            }
        );
    }
    
    /**
     * Gets the configuration available for the given plugin factory.
     * Returns an array of configuration structures {shortName, editRequired, type, params} 
     * where params is in turn an array of struct {description, name, required, value}
     * @param factoryID the factory class of the plugin
     */
    getPluginConfigurations(factoryID: string) {
        console.log("[PluginsServices] getPluginConfigurations");
        var params = {
            factoryID: factoryID
        };
        return this.httpMgr.doGet(this.serviceName, "getPluginConfigurations", params, this.oldTypeService).map(
            stResp => {
                var configurations = [];
                var configColl = stResp.getElementsByTagName("configuration");
                for (var i = 0; i < configColl.length; i++) {
                    var config: any = {};
                    config.shortName = configColl[i].getAttribute("shortName");
                    config.editRequired = configColl[i].getAttribute("editRequired") == "true";
                    config.type = configColl[i].getAttribute("type");
                    
                    var params = [];
                    var parColl = configColl[i].getElementsByTagName("par");
                    for (var j = 0; j < parColl.length; j++) {
                        var param: any = {};
                        param.description = parColl[j].getAttribute("description");
                        param.name = parColl[j].getAttribute("name");
                        param.required = parColl[j].getAttribute("required") == "true";
                        param.value = parColl[j].textContent;
                        params.push(param);
                    }
                    config.params = params;
                    configurations.push(config);
                }
                return configurations;
            }
        );
    }

}