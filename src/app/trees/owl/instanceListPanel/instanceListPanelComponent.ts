import {Component, Input, Output, EventEmitter, ViewChild} from "@angular/core";
import {InstanceListComponent} from "../instanceList/instanceListComponent";
import {ARTURIResource} from "../../../models/ARTResources";

@Component({
	selector: "instance-list-panel",
	templateUrl: "./instanceListPanelComponent.html",
})
export class InstanceListPanelComponent {
    @Input() cls:ARTURIResource;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(InstanceListComponent) viewChildInstanceList: InstanceListComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    
    private selectedInstance:ARTURIResource;
    
	constructor() {}
    
    private refresh() {
        this.selectedInstance = null;
        this.viewChildInstanceList.initList();
    }
    
    private onNodeSelected(instance:ARTURIResource) {
        this.selectedInstance = instance;
        this.nodeSelected.emit(instance);
    }

}