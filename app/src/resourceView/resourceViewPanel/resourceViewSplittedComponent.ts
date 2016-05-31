import {Component, Input} from "@angular/core";
import {ARTResource} from "../../utils/ARTResources";
import {ResourceViewComponent} from "../ResourceViewComponent";

@Component({
    selector: "resource-view-splitted",
    templateUrl: "app/src/resourceView/resourceViewPanel/resourceViewSplittedComponent.html",
    directives: [ResourceViewComponent]
})
export class ResourceViewSplittedComponent {
    
    @Input() resource: ARTResource; //resource that is selected in a tree or list and should be described in the main RV
    
    private resStack: Array<ARTResource> = [];
    private object: ARTResource; //this represent a double clicked object in a resource view (to show in the 2nd RV)
    
    constructor() {}
    
    ngOnChanges(changes) {
        if (changes.resource) {
            this.object = null;
            this.resStack = [];
        }
    }
    
    private closeSecondaryResView() {
        this.object = null;
        this.resStack = [];
    }
    
    private previousResView() {
        this.object = this.resStack.pop();
    }
    
    private objectDblClick(obj: ARTResource) {
        if (this.object != null && this.object.getNominalValue() != obj.getNominalValue() &&
                this.resource.getNominalValue() != obj.getNominalValue()) {
            this.resStack.push(this.object);
            this.object = obj;
        } else if (this.object == null) {
            this.object = obj;
        }
    }
    
}