import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTNode, ARTResource, ARTLiteral, RDFResourceRolesEnum, ResAttribute } from "../../utils/ARTResources";
import { ResourceUtils } from "../../utils/ResourceUtils";

@Component({
	selector: "resource-list",
	templateUrl: "./resourceListComponent.html",
})
export class ResourceListComponent {
	@Input() resources: ARTNode[];
	@Output() nodeSelected = new EventEmitter<ARTNode>();

	private resourceSelected: ARTNode;

	constructor() { }

	private onResourceSelected(resource: ARTNode) {
		this.resourceSelected = resource;
		this.nodeSelected.emit(resource);
	}

}