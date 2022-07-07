import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { ARTNode } from "../../models/ARTResources";

@Component({
    selector: "resource-list",
    templateUrl: "./resourceListComponent.html",
})
export class ResourceListComponent {
    @Input() resources: ARTNode[];
    @Input() rendering: boolean = true;
    @Output() nodeSelected = new EventEmitter<ARTNode>();
    @Output() dblClicked = new EventEmitter<ARTNode>();

    @ViewChild('scrollableContainer') scrollableElement: ElementRef;

    resourceSelected: ARTNode;

    constructor() { }

    onResourceSelected(resource: ARTNode) {
        this.resourceSelected = resource;
        this.nodeSelected.emit(resource);
    }

    onDblClick(resource: ARTNode) {
        this.dblClicked.emit(resource);
    }

    //Resource limitation management
    private initialRes: number = 150;
    private resLimit: number = this.initialRes;
    private increaseRate: number = this.initialRes / 5;
    onScroll() {
        let scrollElement: HTMLElement = this.scrollableElement.nativeElement;
        if (Math.abs(scrollElement.scrollHeight - scrollElement.offsetHeight - scrollElement.scrollTop) < 2) {
            //bottom reached => increase max range if there are more roots to show
            if (this.resLimit < this.resources.length) {
                this.resLimit += this.increaseRate;
            }
        }
    }

}