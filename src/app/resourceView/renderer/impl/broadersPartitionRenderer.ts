import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { SkosServices } from "../../../services/skosServices";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBContext } from "../../../utils/VBContext";
import { ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum, ResourceUtils } from "../../../models/ARTResources";
import { SKOS } from "../../../models/Vocabulary"
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "broaders-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class BroadersPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from partitionRendererSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();

    partition = ResViewPartition.broaders;
    rootProperty: ARTURIResource = SKOS.broader;
    label = "Broaders";
    addBtnImgTitle = "Add broader";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/concept_create.png");
    removeBtnImgTitle = "Remove broader";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add a broader", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var broader: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept as skos:broader
                    this.skosService.addBroaderConcept(<ARTURIResource>this.resource, broader).subscribe(
                        stResp => this.update.emit(null)
                    ) ;
                } else { //it's using a subProperty of skos:broader
                    this.resourcesService.addValue(this.resource, prop, broader).subscribe(
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

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                if (this.rootProperty.getURI() != predicate.getURI()) { //predicate is some subProperty of skos:broader
                    //=> emits broaderRemovedEvent cause it has not been fired by the generic service (removeValue)
                    this.eventHandler.broaderRemovedEvent.emit({concept: <ARTURIResource>this.resource, broader: <ARTURIResource>object});
                }
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) {// removing a skos:broader relation
            return this.skosService.removeBroaderConcept(<ARTURIResource>this.resource, <ARTURIResource>object);
        } else {//predicate is some subProperty of skos:broader
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}