import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";

@Injectable()
export class OntoManagerServices {

    private serviceName = "ontManager";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager) { }
    
    /**
     * Gets the configuration available for the given ontomoly manager.
     * Returns an array of configuration structures {shortName, editRequired, type, params} 
     * where params is in turn an array of struct {description, name, required, value}
     * @param ontMgrID ontology manager id
     */
    getOntManagerParameters(ontMgrID: string) {
        console.log("[OntoManagerServices] getOntManagerParameters");
        var params = {
            ontMgrID: ontMgrID
        };
        return this.httpMgr.doGet(this.serviceName, "getOntManagerParameters", params, this.oldTypeService).map(
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