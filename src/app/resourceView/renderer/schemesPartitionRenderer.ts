import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredObjListRenderer } from "./abstractPredObjListRenderer";
import { SkosServices } from "../../services/skosServices";
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../models/ARTResources";
import { SKOS } from "../../models/Vocabulary";
import { VBEventHandler } from "../../utils/VBEventHandler";

import { PropertyServices } from "../../services/propertyServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourceServices } from "../../services/resourceServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ModalServices } from "../../widget/modal/modalServices";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";

@Component({
    selector: "schemes-renderer",
    templateUrl: "./predicateObjectsListRenderer.html",
})
export class SchemesPartitionRenderer extends AbstractPredObjListRenderer {

    //inherited from AbstractPredObjListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = SKOS.inScheme;
    label = "Schemes";
    addBtnImgTitle = "Add to a ConceptScheme";
    addBtnImgSrc = require("../../../assets/images/conceptScheme_create.png");
    removeBtnImgTitle = "Remove from ConceptScheme";

    constructor(propService: PropertyServices, resourceService: ResourceServices, cfService: CustomFormsServices, skosxlService: SkosxlServices,
        modalService: ModalServices, browsingService: BrowsingServices, rvModalService: ResViewModalServices,
        private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourceService, cfService, skosxlService, modalService, browsingService, rvModalService);
    }

    //add as top concept
    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add Concept to a Scheme", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var scheme: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept to a scheme with skos:inScheme
                    this.skosService.addConceptToScheme(<ARTURIResource>this.resource, scheme).subscribe(
                        stResp => this.update.emit(null)
                    );
                } else { //it's enriching a subProperty of skos:inScheme
                    this.propService.addExistingPropValue(this.resource, prop, scheme.getURI(), RDFTypesEnum.resource).subscribe(
                        stResp => {
                            //Here I should emit conceptAddedToSchemEvent but I can't since I don't know if this.resource has broader and child
                            //(to show in tree when attached). In this rare case I suppose that the user should refresh the tree
                            this.update.emit(null);
                            //emit conceptAddedToSchemEvent when supported
                        }
                    );
                }
            },
            () => { }
        )
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.cfService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) {// removing a skos:inScheme relation
                this.skosService.removeConceptFromScheme(<ARTURIResource>this.resource, <ARTURIResource>object).subscribe(
                    data => this.update.emit(null)
                );
            } else {//predicate is some subProperty of skos:inScheme
                this.resourceService.removePropertyValue(this.resource, predicate, object).subscribe(
                    stResp => {
                        this.eventHandler.conceptRemovedFromSchemeEvent.emit({ concept: <ARTURIResource>this.resource, scheme: <ARTURIResource>object });
                        this.update.emit(null);
                    }
                );
            }
        }
    }

}