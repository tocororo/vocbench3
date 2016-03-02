import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTURIResource} from "../utils/ARTResources";

@Injectable()
export class RefactorServices {

    private serviceName = "Refactor";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler, private deserializer: Deserializer) { }

    /**
     * Changes the URI of a resource. Emits also a resourceRenamedEvent with the oldResource and the newResource
     * @param oldResource the resource to rename
     * @param newResource the new URI
     */
    changeResourceURI(oldResource: ARTURIResource, newResource: string) {
        console.log("[RefactorServices] changeResourceURI");
        var params: any = {
            oldResource : oldResource.getURI(),
            newResource : newResource
        };
        return this.httpMgr.doGet(this.serviceName, "changeResourceURI", params, this.oldTypeService).map(
            stResp => {
                var newResElem = stResp.getElementsByTagName("newResource")[0];
                var newResource = this.deserializer.createURI(newResElem);
                this.eventHandler.resourceRenamedEvent.emit({ oldResource: oldResource, newResource: newResource });
                return newResource;
            }
        );
    }

}