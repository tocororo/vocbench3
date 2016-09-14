import {Component} from "@angular/core";
import {ARTURIResource} from "../utils/ARTResources";

@Component({
    selector: "class-component",
    templateUrl: "./classComponent.html",
    host: { class: "pageComponent" }
})
export class ClassComponent {
    
    private resource:ARTURIResource;
    
    //EVENT LISTENERS 
    private onClassSelected(cls) {
        this.resource = cls;
    }
    
    private onInstanceSelected(instance) {
        this.resource = instance;
    }
    
}