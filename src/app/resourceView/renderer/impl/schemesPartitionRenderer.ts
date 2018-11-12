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
    selector: "schemes-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class SchemesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.schemes;
    rootProperty: ARTURIResource = SKOS.inScheme;
    label = "Schemes";
    addBtnImgTitle = "Add to a ConceptScheme";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/conceptScheme_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add Concept to a Scheme", this.resource, predicate, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: Observable<any>[] = [];

                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept to a scheme with skos:inScheme
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push(this.skosService.addConceptToScheme(<ARTURIResource>this.resource, v));
                    });
                } else { //it's enriching a subProperty of skos:inScheme
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push(
                            this.resourcesService.addValue(this.resource, prop, v).map(
                                stResp => {
                                    ////Here I should emit conceptAddedToSchemEvent but I can't since I don't know if this.resource has broader and child
                                    ////to show in tree when attached). In this rare case I suppose that the user should refresh the tree
                                }
                            )
                        );
                    });
                }
                this.addMultiple(addFunctions);
            },
            () => { }
        )
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                if (this.rootProperty.getURI() != predicate.getURI()) {
                    //=> emits conceptRemovedFromSchemeEvent cause it has not been fired by the generic service (removeValue)
                    this.eventHandler.conceptRemovedFromSchemeEvent.emit({ concept: <ARTURIResource>this.resource, scheme: <ARTURIResource>object });
                }
                this.update.emit(null)
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) {// removing a skos:inScheme relation
            return this.skosService.removeConceptFromScheme(<ARTURIResource>this.resource, <ARTURIResource>object);
        } else {//predicate is some subProperty of skos:inScheme
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}