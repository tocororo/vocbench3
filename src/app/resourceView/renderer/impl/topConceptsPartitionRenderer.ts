import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { SKOS } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SkosServices } from "../../../services/skosServices";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "top-concepts-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class TopConceptsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.topconceptof;
    rootProperty: ARTURIResource = SKOS.topConceptOf;
    label = "Top Concept of";
    addBtnImgTitle = "Add to a skos:ConceptScheme as topConcept";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/conceptScheme_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Set as top Concept of", this.resource, predicate, propChangeable).then(
            (data: any) => {

                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: Observable<any>[] = [];

                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept as skos:topConceptOf
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push(this.skosService.addTopConcept(<ARTURIResource>this.resource, v));
                    });
                } else { //it's adding a subProperty of skos:topConceptOf
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push(
                            this.resourcesService.addValue(this.resource, prop, v).map(
                                stResp => {
                                    this.eventHandler.topConceptCreatedEvent.emit({concept: <ARTURIResource>this.resource, schemes: [v]});
                                }
                            )
                        );
                    });
                }
                this.addMultiple(addFunctions);
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