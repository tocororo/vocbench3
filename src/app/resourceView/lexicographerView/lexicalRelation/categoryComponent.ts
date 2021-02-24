import { Component, Input, SimpleChanges } from "@angular/core";
import { ARTURIResource } from "src/app/models/ARTResources";
import { ResourceUtils } from "src/app/utils/ResourceUtils";

@Component({
    selector: "category",
    templateUrl: "./categoryComponent.html",
    styles: [`.category { padding: 1px 2px; border-radius: 3px; }`]
})
export class CategoryComponent {
    @Input() category: ARTURIResource;

    renderingClass: string = "category";

    constructor() { }

    ngOnChanges(change: SimpleChanges) {
        if (change['category']) {
            this.initRenderingClass();
        }
    }

    private initRenderingClass() {
        if (ResourceUtils.isResourceInStagingAdd(this.category)) {
            this.renderingClass += " proposedAddRes";
        } else if (ResourceUtils.isResourceInStagingRemove(this.category)) {
            this.renderingClass += " proposedRemoveRes";
        }
        if (ResourceUtils.isTripleInStagingAdd(this.category)) {
            this.renderingClass += " proposedAddTriple";
        } else if (ResourceUtils.isTripleInStagingRemove(this.category)) {
            this.renderingClass += " proposedRemoveTriple";
        }
    }

}