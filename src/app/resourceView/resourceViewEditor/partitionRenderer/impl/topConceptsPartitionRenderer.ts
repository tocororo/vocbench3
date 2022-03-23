import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { ARTNode, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SkosServices } from "../../../../services/skosServices";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "top-concepts-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class TopConceptsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.topconceptof;
    addBtnImgSrc = "./assets/images/icons/actions/conceptScheme_create.png";

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        private skosService: SkosServices, private eventHandler: VBEventHandler) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue({key:"DATA.ACTIONS.SET_AS_TOP_CONCEPT"}, this.resource, predicate, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: MultiActionFunction[] = [];
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push({
                        function: this.skosService.addTopConcept(<ARTURIResource>this.resource, v, prop),
                        value: v
                    });
                });
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