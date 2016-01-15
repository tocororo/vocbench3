import {Component} from "angular2/core";
import {ClassTreePanelComponent} from "./classTreePanel/ClassTreePanelComponent";

@Component({
	selector: "class-component",
	templateUrl: "app/src/owl/classComponent.html",
	directives: [ClassTreePanelComponent]
})
export class ClassComponent {
    
	constructor() {}
    
}