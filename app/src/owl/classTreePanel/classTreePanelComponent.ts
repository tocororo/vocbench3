import {Component, Input} from "angular2/core";
import {ClassTreeComponent} from "../../tree/classTree/ClassTreeComponent";
import {ARTURIResource} from "../../utils/ARTResources";

@Component({
	selector: "class-tree-panel",
	templateUrl: "app/src/owl/classTreePanel/classTreePanelComponent.html",
	directives: [ClassTreeComponent]
})
export class ClassTreePanelComponent {
    @Input('rootclass') rootClass:ARTURIResource;
    private selectedClass:ARTURIResource;
    
	constructor() {}
    
    createClass() {
        alert("create class");
    }
    
    /* the following methods still cannot be used 'cause to selectedClass should be updated 
       through event emitted from. Need to understand how to emit/broadcast event in NG2 */ 
    createSubClass() {
        alert("create subclass of..." + JSON.stringify(this.selectedClass));
    }
    
    deleteClass() {
        alert("delete class..." + JSON.stringify(this.selectedClass));
    }
    
}