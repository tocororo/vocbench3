import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { ARTNode, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "disjoint-properties-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class DisjointPropertiesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.disjointProperties;
    addBtnImgSrc = "./assets/images/icons/actions/property_create.png";

    constructor(
        resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue({ key: "DATA.ACTIONS.ADD_DISJOINT_PROPERTY" }, this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let inverse: boolean = data.inverseProperty;
                let values: ARTURIResource[] = data.value;

                let addFunctions: MultiActionFunction[] = [];
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push({
                        function: this.propService.addPropertyDisjointWith(<ARTURIResource>this.resource, v, prop, inverse),
                        value: v
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.propService.removePropertyDisjointWith(<ARTURIResource>this.resource, <ARTURIResource>object, predicate);
    }

}