import {Component} from "@angular/core";
import {ClassTreePanelComponent} from "./classTreePanel/classTreePanelComponent";
import {ResourceViewPanelComponent} from "../resourceView/resourceViewPanel/resourceViewPanelComponent";
import {ARTURIResource} from "../utils/ARTResources";

@Component({
    selector: "class-component",
    templateUrl: "app/src/owl/classComponent.html",
    directives: [ClassTreePanelComponent, ResourceViewPanelComponent],
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