import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { IndividualsServices } from "../../../services/individualsServices";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../../models/ARTResources";
import { RDF } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "types-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class TypesPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.types;
    rootProperty: ARTURIResource = RDF.type;
    label = "Types";
    addBtnImgTitle = "Add a type";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/class_create.png");
    removeBtnImgTitle = "Remove type";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private individualService: IndividualsServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.resViewModals.addPropertyValue("Add a type", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var typeClass: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding an rdf:type
                    this.individualService.addType(<ARTURIResource>this.resource, typeClass).subscribe(
                        stResp => this.update.emit(null)
                    ) ;
                } else { //it's adding a subProperty of rdf:type
                    this.resourcesService.addValue(this.resource, prop, typeClass).subscribe(
                        stResp => {
                            this.eventHandler.typeAddedEvent.emit({resource: this.resource, type: typeClass});
                            this.update.emit(null);
                        }
                    );
                }
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
                if (this.rootProperty.getURI() != predicate.getURI()) {
                    //=> emits typeRemovedEvent cause it has not been fired by the generic service (removeValue)
                    this.eventHandler.typeRemovedEvent.emit({resource: this.resource, type: <ARTResource>object});
                }
                this.update.emit(null);
            }
        )
    }

    getRemoveFunction(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            return this.cfService.removeReifiedResource(this.resource, predicate, object);
        } else {
            if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdf:type relation
                return this.individualService.removeType(<ARTURIResource>this.resource, <ARTResource>object);
            } else {//predicate is some subProperty of rdf:type
                return this.resourcesService.removeValue(this.resource, predicate, object);
            }
        }
    }

}