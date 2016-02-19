import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";

@Injectable()
export class RefactorServices {

    private serviceName = "Refactor";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private deserializer: Deserializer) { }

    changeResourceURI(oldResource: string, newResource: string) {
        console.log("[RefactorServices] changeResourceURI");
        var params: any = {
            oldResource : oldResource,
            newResource : newResource
        };
        return this.httpMgr.doGet(this.serviceName, "changeResourceURI", params, this.oldTypeService).map(
            stResp => {
                var oldResElem = stResp.getElementsByTagName("oldResource")[0];
                var oldURIResource = this.deserializer.createURI(oldResElem);
                var newResElem = stResp.getElementsByTagName("newResource")[0];
                var newURIResource = this.deserializer.createURI(newResElem);
                this.eventHandler.resourceRenamedEvent.emit({ oldResource: oldURIResource, newResource: newURIResource });
                return newURIResource;
            }
        );
    }

}