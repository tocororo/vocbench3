import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredObjListRenderer } from "./abstractPredObjListRenderer";
import { SkosServices } from "../../services/skosServices";
import { VBEventHandler } from "../../utils/VBEventHandler"
import { ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../models/ARTResources";
import { SKOS } from "../../models/Vocabulary"

import { PropertyServices } from "../../services/propertyServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourceServices } from "../../services/resourceServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ModalServices } from "../../widget/modal/modalServices";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";

@Component({
    selector: "broaders-renderer",
    templateUrl: "./predicateObjectsListRenderer.html",
})
export class BroadersPartitionRenderer extends AbstractPredObjListRenderer {

    //inherited from AbstractPredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();

    rootProperty: ARTURIResource = SKOS.broader;
    label = "Broaders";
    addBtnImgTitle = "Add broader";
    addBtnImgSrc = require("../../../assets/images/concept_create.png");
    removeBtnImgTitle = "Remove broader";

    constructor(propService: PropertyServices, resourceService: ResourceServices, cfService: CustomFormsServices, skosxlService: SkosxlServices,
        modalService: ModalServices, browsingService: BrowsingServices, resViewModalService: ResViewModalServices,
        private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourceService, cfService, skosxlService, modalService, browsingService, resViewModalService);
    }
    

    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add a broader", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var broader: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept as skos:broader
                    this.skosService.addBroaderConcept(<ARTURIResource>this.resource, broader).subscribe(
                        stResp => this.update.emit(null)
                    ) ;
                } else { //it's using a subProperty of skos:broader
                    this.propService.addExistingPropValue(this.resource, prop, broader.getURI(), RDFTypesEnum.resource).subscribe(
                        stResp =>{
                            this.eventHandler.broaderAddedEvent.emit({narrower: <ARTURIResource>this.resource, broader: broader});
                            this.update.emit(null);
                        }
                    );
                }
            },
            () => {}
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //predicate is skos:broader
                this.skosService.removeBroaderConcept(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                    stResp => this.update.emit(null)
                );
            } else {//predicate is some subProperty of skos:broader
                this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                    stResp => {
                        this.eventHandler.broaderRemovedEvent.emit({concept: <ARTURIResource>this.resource, broader: <ARTURIResource>object});
                        this.update.emit(null);
                    }
                );
            }
        }
    }

}