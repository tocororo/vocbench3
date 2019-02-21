import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { RDF } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { IndividualsServices } from "../../../services/individualsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { MultiAddFunction } from "../partitionRenderer";

@Component({
    selector: "types-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class TypesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.types;
    rootProperty: ARTURIResource = RDF.type;
    label = "Types";
    addBtnImgTitle = "Add a type";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/cls_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private individualService: IndividualsServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add a type", this.resource, predicate, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: MultiAddFunction[] = [];

                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding an rdf:type
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push({
                            function: this.individualService.addType(<ARTURIResource>this.resource, v),
                            value: v
                        });
                    });
                } else { //it's adding a subProperty of rdf:type
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push({
                            function: this.resourcesService.addValue(this.resource, prop, v).map(
                                stResp => {
                                    this.eventHandler.typeAddedEvent.emit({resource: this.resource, type: v});
                                }
                            ),
                            value: v
                        });
                    });
                }
                this.addMultiple(addFunctions);
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

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdf:type relation
            return this.individualService.removeType(<ARTURIResource>this.resource, <ARTResource>object);
        } else {//predicate is some subProperty of rdf:type
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}