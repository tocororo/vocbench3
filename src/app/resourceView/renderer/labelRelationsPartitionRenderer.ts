import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectsListRenderer } from "./abstractPredicateObjectsListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ARTResource, ARTURIResource, ARTNode, RDFTypesEnum, ResAttribute } from "../../utils/ARTResources";
import { SKOSXL } from "../../utils/Vocabulary";

@Component({
    selector: "label-relations-renderer",
    templateUrl: "./predicateObjectsListRenderer.html",
})
export class LabelRelationsPartitionRenderer extends AbstractPredicateObjectsListRenderer {

    //inherited from AbstractPredicateObjectsListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = SKOSXL.labelRelation;
    label = "Label relations";
    addBtnImgTitle = "Add a label relation";
    addBtnImgSrc = require("../../../assets/images/propObject_create.png");
    removeBtnImgTitle = "Remove label relation";

    constructor(private crService: CustomRangeServices, private propService: PropertyServices, private resourceService: ResourceServices,
        private rvModalService: ResViewModalServices) {
        super();
    }

    add(predicate: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a label relation", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var label: ARTResource = data.value;
                this.propService.addExistingPropValue(this.resource, prop, label.getNominalValue(), RDFTypesEnum.resource).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }

}