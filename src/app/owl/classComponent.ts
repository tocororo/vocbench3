import {Component} from "@angular/core";
import {ARTURIResource} from "../utils/ARTResources";

@Component({
    selector: "class-component",
    templateUrl: "./classComponent.html",
    host: { class: "pageComponent" }
})
export class ClassComponent {
    
    private resource: ARTURIResource;
    
    //EVENT LISTENERS 
    private onClassSelected(cls: ARTURIResource) {
        this.resource = cls;
    }
    
    private onInstanceSelected(instance: ARTURIResource) {
        this.resource = instance;
    }
    
}