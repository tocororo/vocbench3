import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { SkosServices } from "../../../services/skosServices";
import { ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../../models/ARTResources";
import { SKOS } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "top-concepts-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class TopConceptsPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource: ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();

    partition = ResViewPartition.topconceptof;
    rootProperty: ARTURIResource = SKOS.topConceptOf;
    label = "Top Concept of";
    addBtnImgTitle = "Add to a skos:ConceptScheme as topConcept";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/conceptScheme_create.png");
    removeBtnImgTitle = "Remove as topConcept";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Set as top Concept of", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var scheme: ARTURIResource = data.value;
                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept as skos:topConceptOf
                    this.skosService.addTopConcept(<ARTURIResource>this.resource, scheme).subscribe(
                        stResp => this.update.emit(null)
                    ) ;
                } else { //it's adding a subProperty of skos:topConceptOf
                    this.resourcesService.addValue(this.resource, prop, scheme).subscribe(
                        stResp => {
                            this.eventHandler.topConceptCreatedEvent.emit({concept: <ARTURIResource>this.resource, schemes: [scheme]});
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
                if (this.rootProperty.getURI() != predicate.getURI()) {
                    //=> emits conceptRemovedAsTopConceptEvent cause it has not been fired by the generic service (removeValue)
                    this.eventHandler.conceptRemovedAsTopConceptEvent.emit({concept: <ARTURIResource>this.resource, scheme: <ARTURIResource>object});
                }
                this.update.emit();
            }
        )
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) { //removing skos:topConceptOf relation
            return this.skosService.removeTopConcept(<ARTURIResource>this.resource, <ARTURIResource>object);
        } else {//predicate is some subProperty of skos:topConceptOf
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}