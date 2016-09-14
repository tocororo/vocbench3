import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {VBEventHandler} from "../utils/VBEventHandler";
import {ARTResource, ARTURIResource} from "../utils/ARTResources";

@Injectable()
export class DeleteServices {

    private serviceName = "delete";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Removes an instance. Emits an instanceDeletedEvent with instance (the removed instance) and
     * cls (the type of the instance)
     * @param instance the instance to remove
     * @param cls the type of the instance. This parameter is not necessary for the request, but is needed for the event
     */
    removeInstance(instance: ARTResource, cls: ARTURIResource) {
        console.log("[DeleteServices] removeInstance");
        var params: any = {
            name: instance.getNominalValue(),
            type: "Instance",
        };
        return this.httpMgr.doGet(this.serviceName, "removeInstance", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.instanceDeletedEvent.emit({instance: instance, cls: cls});
                return stResp;
            }
        );
    }

    /**
     * Removes a class. Emits a classDeletedEvent with the removed class
     * @param cls class to remove
     */
    removeClass(cls: ARTURIResource) {
        console.log("[DeleteServices] deleteClass");
        var params: any = {
            name: cls.getURI(),
            type: "Class",
        };
        return this.httpMgr.doGet(this.serviceName, "removeClass", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.classDeletedEvent.emit(cls);
                return stResp;
            }
        );
    }

    /**
     * Removes the given property. Emits a propertyDeletedEvent with property (the deleted property)
     * @param property the property to remove
     * @return the deleted property
     */
    removeProperty(property: ARTURIResource) {
        console.log("[DeleteServices] removeProperty");
        var params: any = {
            name: property.getURI(),
            type: "Property",
        };
        return this.httpMgr.doGet(this.serviceName, "removeProperty", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.propertyDeletedEvent.emit(property);
                return property;
            }
        );
    }

}