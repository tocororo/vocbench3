import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTURIResource } from "src/app/models/ARTResources";
import { Constituent } from "src/app/models/LexicographerView";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { VBActionsEnum } from "src/app/utils/VBActions";

@Component({
    selector: "constituent-feature",
    templateUrl: "./constituentFeatureRenderer.html",
})
export class constituentFeatureRenderer {
    @Input() readonly: boolean;
    @Input() constituent: Constituent;
    @Input() predicate: ARTURIResource; //facet morpho prop
    @Input() value: ARTURIResource;
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update

    removeFacetAuthorized: boolean;

    proposedAdd: boolean;
    proposedRemove: boolean;

    constructor(private resourceService: ResourcesServices) {}

    ngOnInit() {
        if (ResourceUtils.isTripleInStagingAdd(this.value)) {
            this.proposedAdd = true;
            this.readonly = true;
        } else if (ResourceUtils.isTripleInStagingRemove(this.value)) {
            this.proposedRemove = true;
            this.readonly = true;
        }
        this.removeFacetAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.constituent.id) && !this.readonly;
    }

    removeFacet() {
        this.resourceService.removeValue(this.constituent.id, this.predicate, this.value).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

}