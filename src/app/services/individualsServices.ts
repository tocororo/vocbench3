import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTResource, ARTURIResource, ARTNode, ARTBNode, ResAttribute} from "../utils/ARTResources";

@Injectable()
export class IndividualsServices {

    private serviceName = "Individuals";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the (explicit) named types of the given individual
     * @param individual
     */
    getNamedTypes(individual: ARTResource): Observable<ARTURIResource[]> {
        console.log("[IndividualsServices] getNamedTypes");
        var params: any = {
            individual: individual
        };
        return this.httpMgr.doGet(this.serviceName, "getNamedTypes", params, this.oldTypeService, true).map(
            stResp => {
                var types = Deserializer.createResourceArray(stResp);
                return types;
            }
        );
    }
    
}