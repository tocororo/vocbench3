import { Component } from "@angular/core";
import { Observable, of } from 'rxjs';
import { ARTNode, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "form-based-preview-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class FormBasedPreviewRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.formBasedPreview;
    addBtnImgSrc: any = null; //do not show the add icon

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        ) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    /**
     * Following methods are not used, Every action is disabled in this partition since it is only a preview
     */

    add(predicate: ARTURIResource, propChangeable: boolean) {}

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(true);
    }

    
    removePredicateObject(predicate: ARTURIResource, object: ARTNode) { }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }

}