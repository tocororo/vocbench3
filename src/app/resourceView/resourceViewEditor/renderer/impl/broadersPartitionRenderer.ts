import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { ARTNode, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SkosServices } from "../../../../services/skosServices";
import { VBContext } from "../../../../utils/VBContext";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "broaders-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class BroadersPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.broaders;
    addBtnImgTitle = "Add broader";
    addBtnImgSrc = "../../../../../assets/images/icons/actions/concept_create.png";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    //@Override
    getPredicateToEnrich(): Observable<ARTURIResource> {
        let broaderPropUri = VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences.baseBroaderUri;
        if (broaderPropUri != this.rootProperty.getURI()) {
            return this.resourcesService.getResourceDescription(new ARTURIResource(broaderPropUri)).pipe(
                map(res => {
                    return <ARTURIResource>res;
                })
            );
        } else {
            return of(this.rootProperty);
        }
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add a broader", this.resource, predicate, propChangeable, this.rootProperty).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: MultiActionFunction[] = [];

                if (prop.getURI() == this.rootProperty.getURI()) { //it's adding a concept as skos:broader
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push({
                            function: this.skosService.addBroaderConcept(<ARTURIResource>this.resource, v),
                            value: v
                        });
                    });
                } else { //it's enriching a subProperty of skos:broader
                    values.forEach((v: ARTURIResource) => {
                        addFunctions.push({
                            function: this.resourcesService.addValue(this.resource, prop, v).pipe(
                                map(stResp => {
                                    this.eventHandler.broaderAddedEvent.emit({narrower: <ARTURIResource>this.resource, broader: v});
                                })
                            ),
                            value: v
                        });
                    });
                }
                this.addMultiple(addFunctions);
            },
            () => {}
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
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