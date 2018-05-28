import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { OWL } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "disjoint-properties-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class DisjointPropertiesPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.disjointProperties;
    rootProperty: ARTURIResource = OWL.propertyDisjointWith;
    label = "Disjoint properties";
    addBtnImgTitle = "Add a disjoint property";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/prop_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add a disjoint property", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var equivProp: ARTURIResource = data.value;
                this.propService.addPropertyDisjointWith(<ARTURIResource>this.resource, equivProp, prop).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        )
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
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