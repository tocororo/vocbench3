import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectsListRenderer } from "./abstractPredicateObjectsListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { VBEventHandler } from "../../utils/VBEventHandler"
import { ARTNode, ARTURIResource, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../models/ARTResources";
import { RDFS } from "../../models/Vocabulary";


@Component({
    selector: "superproperties-renderer",
    templateUrl: "./predicateObjectsListRenderer.html",
})
export class SuperPropertiesPartitionRenderer extends AbstractPredicateObjectsListRenderer {

    //inherited from AbstractPredicateObjectsListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = RDFS.subPropertyOf;
    label = "Superproperties";
    addBtnImgTitle = "Add a superproperty";
    addBtnImgSrc = require("../../../assets/images/prop_create.png");
    removeBtnImgTitle = "Remove superproperty";

    constructor(private propService: PropertyServices, private resourceService: ResourceServices, private crService: CustomRangeServices,
        private eventHandler: VBEventHandler, private rvModalService: ResViewModalServices) {
        super();
    }

    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a superproperty", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var superProp: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's using rdfs:subPropertyOf
                    this.propService.addSuperProperty(<ARTURIResource>this.resource, superProp).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's enriching a subProperty of rdfs:subPropertyOf
                    this.propService.addExistingPropValue(this.resource, prop, superProp.getURI(), RDFTypesEnum.resource).subscribe(
                        stResp => {
                            //Here I should emit superPropertyAddedEvent but I can't since I don't know if this.resource has child
                            //(to show in tree when attached). In this rare case I suppose that the user should refresh the tree
                            this.update.emit(null);
                        }
                    );
                }
            },
            () => { }
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) {// removing a rdfs:subPropertyOf relation
                this.propService.removeSuperProperty(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                    stResp => this.update.emit(null)
                );
            } else {//predicate is some subProperty of rdfs:subPropertyOf
                this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                    stResp => {
                        this.eventHandler.superPropertyRemovedEvent.emit({ property: <ARTURIResource>this.resource, superProperty: <ARTURIResource>object });
                        this.update.emit(null);
                    }
                );
            }
        }
    }

}