import { Component } from "@angular/core";
import { AbstractResourceViewPanel } from "./abstractResourceViewPanel";
import { ARTResource, ResAttribute } from "../../models/ARTResources";
import { ResourceViewComponent } from "../resourceViewComponent";

@Component({
    selector: "resource-view-splitted",
    templateUrl: "./resourceViewSplittedComponent.html",
})
export class ResourceViewSplittedComponent extends AbstractResourceViewPanel {

    private resource: ARTResource; //resource that is selected in a tree or list and should be described in the main RV

    private resStack: Array<ARTResource> = [];
    private object: ARTResource; //this represent a double clicked object in a resource view (to show in the 2nd RV)

    selectResource(resource: ARTResource) {
        this.resource = resource;
    }

    deleteResource(resource: ARTResource) {
        this.resource = null;
        this.object = null;
        this.resStack = [];
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

}