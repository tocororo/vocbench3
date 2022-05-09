import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { ARTNode, ARTResource, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { IndividualsServices } from "../../../../services/individualsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "types-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class TypesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.types;
    addBtnImgSrc = "./assets/images/icons/actions/cls_create.png";

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        private individualService: IndividualsServices, private eventHandler: VBEventHandler) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue({ key: "DATA.ACTIONS.ADD_TYPE" }, this.resource, predicate, propChangeable).then(
            (data: any) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: MultiActionFunction[] = [];

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
                            function: this.resourcesService.addValue(this.resource, prop, v).pipe(
                                map(stResp => {
                                    this.eventHandler.typeAddedEvent.emit({ resource: this.resource, type: v });
                                })
                            ),
                            value: v
                        });
                    });
                }
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                if (this.rootProperty.getURI() != predicate.getURI()) {
                    //=> emits typeRemovedEvent cause it has not been fired by the generic service (removeValue)
                    this.eventHandler.typeRemovedEvent.emit({ resource: this.resource, type: <ARTResource>object });
                }
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (this.rootProperty.getURI() == predicate.getURI()) { //removing rdf:type relation
            return this.individualService.removeType(<ARTURIResource>this.resource, <ARTResource>object);
        } else { //predicate is some subProperty of rdf:type
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
    }

}