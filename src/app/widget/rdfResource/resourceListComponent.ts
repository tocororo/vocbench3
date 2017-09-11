import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { ARTNode } from "../../models/ARTResources";

@Component({
	selector: "resource-list",
	templateUrl: "./resourceListComponent.html",
})
export class ResourceListComponent {
	@Input() resources: ARTNode[];
	@Output() nodeSelected = new EventEmitter<ARTNode>();

	@ViewChild('scrollableContainer') scrollableElement: ElementRef;

	private resourceSelected: ARTNode;

	constructor() { }

	private onResourceSelected(resource: ARTNode) {
		this.resourceSelected = resource;
		this.nodeSelected.emit(resource);
	}

	//Resource limitation management
	private initialRes: number = 50;
	private resLimit: number = this.initialRes;
	private increaseRate: number = this.initialRes / 5;
	private onScroll() {
		let scrollElement: HTMLElement = this.scrollableElement.nativeElement;
		if (scrollElement.scrollTop === (scrollElement.scrollHeight - scrollElement.offsetHeight)) {
			//bottom reached => increase max range if there are more roots to show
			if (this.resLimit < this.resources.length) {
				this.resLimit = this.resLimit + this.increaseRate;
			}
		}
	}

}