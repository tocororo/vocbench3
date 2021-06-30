import { Component } from "@angular/core";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { ARTResource, ResAttribute } from "../../models/ARTResources";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { AbstractResViewVisualizationMode } from "./abstractResViewVisualization";

@Component({
    selector: "resource-view-splitted",
    templateUrl: "./resourceViewSplittedComponent.html",
    host: { class: "hbox" }
})
export class ResourceViewSplittedComponent extends AbstractResViewVisualizationMode {

    resource: ARTResource; //resource that is selected in a tree or list and should be described in the main RV

    private resStack: Array<ARTResource> = [];
    object: ARTResource; //this represent a double clicked object in a resource view (to show in the 2nd RV)

    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

    selectResource(resource: ARTResource) {
        this.resource = resource;
    }

    deleteResource(resource: ARTResource) {
        if (this.resource != null && this.resource.equals(resource)) {
            this.resource = null;
            this.object = null;
            this.resStack = [];
            this.empty.emit();
        } else {
            let idx = ResourceUtils.indexOfNode(this.resStack, resource);
            if (idx != -1) {
                this.resStack.splice(idx, 1);
            }
        }
    }

    private closeSecondaryResView() {
        this.object = null;
        this.resStack = [];
    }

    private previousResView() {
        this.object = this.resStack.pop();
    }

    /**
     * Returns the resource described in the main RV (null if no RV is open)
     * Useful for the ResourceViewPanel in order to keep a resource when the RViewMode changes
     */
    getMainResource(): ARTResource {
        return this.resource;
    }

    objectDblClick(obj: ARTResource) {
        if (this.object != null && this.object.getNominalValue() != obj.getNominalValue() &&
            this.resource.getNominalValue() != obj.getNominalValue()) {
            this.resStack.push(this.object);
            this.object = obj;
        } else if (this.object == null) {
            this.object = obj;
        }
    }

    /**
     * When changes on (left/main) resource view make change the show of the resource, updates the resource.
     * NB this udpate affects also the resource in the tree (since resource stored the object passed from the tree)
     */
    private onMainResourceUpdate(resource: ARTResource) {
        this.resource[ResAttribute.SHOW] = resource.getShow();
        this.resource[ResAttribute.ROLE] = resource.getRole();
    }

    /**
     * When changes on (right/secondary) resource view make change the show of the resource, updates the resource.
     * NB this udpate affects also the resource in the main RV (since object stored the object passed from the main RV)
     */
    private onSecondaryResourceUpdate(resource: ARTResource) {
        this.object[ResAttribute.SHOW] = resource.getShow();
        this.object[ResAttribute.ROLE] = resource.getRole();
    }

    onRefreshDataBroadcast() {
        this.deleteResource(null); //reset main and secondary resources and the stach resources
    }

}