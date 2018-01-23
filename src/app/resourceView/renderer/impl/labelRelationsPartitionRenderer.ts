import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { ARTResource, ARTURIResource, ARTNode, RDFTypesEnum, ResAttribute } from "../../../models/ARTResources";
import { SKOSXL } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "label-relations-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class LabelRelationsPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.labelRelations;
    rootProperty: ARTURIResource = SKOSXL.labelRelation;
    label = "Label relations";
    addBtnImgTitle = "Add a label relation";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/propObject_create.png");
    removeBtnImgTitle = "Remove label relation";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        rvModalService: ResViewModalServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, rvModalService);
    }

    add(predicate: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a label relation", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var label: ARTResource = data.value;
                this.resourcesService.addValue(this.resource, prop, label).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit()
        )
    }

    getRemoveFunction(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            return this.cfService.removeReifiedResource(this.resource, predicate, object);
        } else {
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}