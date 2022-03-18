import { Component, Input } from "@angular/core";
import { ARTResource } from "src/app/models/ARTResources";
import { AbstractSingleValueView } from "src/app/models/CustomViews";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AbstractViewRendererComponent } from "./abstractViewRenderer";

@Component({
    selector: "single-value-renderer",
    templateUrl: "./singleValueRendererComponent.html",
})
export class SingleValueRendererComponent extends AbstractViewRendererComponent {

    @Input() view: AbstractSingleValueView;


    constructor(private resourceService: ResourcesServices) {
        super();
    }

    ngOnInit() {
        if (this.view.value.resource instanceof ARTResource) {
            this.resourceService.getResourceDescription(this.view.value.resource).subscribe(
                annRes => {
                    this.view.value.resource = annRes;
                }
            );
        }
    }

    protected processInput(): void {
    }
    
    onUpdate() {
        this.update.emit();
    }


}