import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectListRenderer } from "./abstractPredicateObjectListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { SkosServices } from "../../services/skosServices";
import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../utils/ARTResources";
import { VocbenchCtx } from "../../utils/VocbenchCtx";
import { VBEventHandler } from "../../utils/VBEventHandler"
import { SKOS } from "../../utils/Vocabulary"

@Component({
    selector: "broaders-renderer",
    templateUrl: "./predicateObjectListRenderer.html",
})
export class BroadersPartitionRenderer extends AbstractPredicateObjectListRenderer {

    //inherited from AbstractPredicateObjectListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();

    rootProperty: ARTURIResource = SKOS.broader;
    label = "Broaders";
    addBtnImgTitle = "Add broader";
    addBtnImgSrc = require("../../../assets/images/concept_create.png");
    removeBtnImgTitle = "Remove broader";

    constructor(private crService: CustomRangeServices, private propService: PropertyServices, private resourceService: ResourceServices,
        private skosService: SkosServices, private browsingService: BrowsingServices, private rvModalService: ResViewModalServices,
        private eventHandler: VBEventHandler, private vbCtx: VocbenchCtx) {
        super();
    }

    add() {
        this.rvModalService.addPropertyValue("Add a broader", this.resource, this.rootProperty).then(
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

    enrichProperty(predicate: ARTURIResource) {
        this.browsingService.browseConceptTree("Add a " + predicate.getShow(), this.vbCtx.getScheme(), true).then(
            (selectedConcept: any) => {
                if (predicate.getURI() == this.rootProperty.getURI()) {
                    this.skosService.addBroaderConcept(<ARTURIResource>this.resource, selectedConcept).subscribe(
                        stResp => this.update.emit()
                    );
                } else { //predicate is some subProperty of skos:broader
                    this.propService.addExistingPropValue(this.resource, predicate, (<ARTURIResource>selectedConcept).getNominalValue(), RDFTypesEnum.resource).subscribe(
                        stResp => this.update.emit(null)
                    );
                }
            },
            () => { }
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
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