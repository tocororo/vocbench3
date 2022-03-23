import { Component, Input } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AbstractSingleValueView, AdvSingleValueView } from "src/app/models/CustomViews";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AbstractSingleViewRendererComponent } from "./abstractSingleViewRenderer";

@Component({
    selector: "single-value-renderer",
    templateUrl: "./singleValueRendererComponent.html",
})
export class SingleValueRendererComponent extends AbstractSingleViewRendererComponent {

    @Input() view: AbstractSingleValueView;


    constructor(private resourceService: ResourcesServices, private cvService: CustomViewsServices) {
        super();
    }

    ngOnInit() {
        super.ngOnInit()
        if (this.view.value.resource instanceof ARTResource) {
            //getResourcesInfo instead of getResourceDescription since the latter requires that the provided resource is locally defined (so prevent error in case of external reference)
            this.resourceService.getResourcesInfo([this.view.value.resource]).subscribe(
                (annRes: ARTURIResource[]) => {
                    this.view.value.resource = annRes.find(r => r.equals(this.view.value.resource));
                }
            );
        }
    }

    protected processInput(): void {
        //Nothing to do
    }
    
    onUpdate(data: { old: ARTNode, new: ARTNode }) {
        let pivots: Map<string, ARTNode> = new Map();
        if (this.view instanceof AdvSingleValueView) {
            for (let pivotName in this.view.value.pivots) {
                pivots.set(pivotName, this.view.value.pivots[pivotName]);
            }
        }
        this.cvService.updateSingleValueData(this.subject, this.predicate, data.old, data.new, pivots).subscribe(
            () => {
                this.update.emit();
            }
        )
        
    }


}