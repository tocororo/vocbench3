import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {VBEventHandler} from "../utils/VBEventHandler";

@Injectable()
export class RefactorServices {

    private serviceName = "Refactor";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    renameResource(oldResource: string, newResource: string) {
        console.log("[RefactorServices] renameResource");
        var params: any = {
            oldResource : oldResource,
            newResource : newResource
        };
        return this.httpMgr.doGet(this.serviceName, "renameResource", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.resourceRenamedEvent.emit({ oldResourceURI: oldResource, newResourceURI: newResource });
                return stResp;
            }
        );
    }

}