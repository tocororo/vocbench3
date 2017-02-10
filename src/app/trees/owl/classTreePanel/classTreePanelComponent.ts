import {Component, Input, Output, EventEmitter, ViewChild} from "@angular/core";
import {ClassTreeComponent} from "../classTree/classTreeComponent";
import {ARTURIResource} from "../../../models/ARTResources";

@Component({
	selector: "class-tree-panel",
	templateUrl: "./classTreePanelComponent.html",
})
export class ClassTreePanelComponent {
    @Input() roots: ARTURIResource[]; //root classes
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    
    private selectedClass:ARTURIResource;
    
	constructor() {}
    
    private refresh() {
        this.selectedClass = null; //instance list refresh automatically after this since it listen for changes on cls
        this.viewChildTree.initTree();
    }

    //EVENT LISTENERS
    private onNodeSelected(node: ARTURIResource) {
        this.selectedClass = node;
        this.nodeSelected.emit(node);
    }

}