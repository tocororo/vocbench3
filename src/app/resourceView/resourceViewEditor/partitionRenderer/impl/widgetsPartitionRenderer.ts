import { Component, Input } from "@angular/core";
import { Observable, of } from "rxjs";
import { ARTNode, ARTURIResource } from "src/app/models/ARTResources";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { ResViewPartition } from "../../../../models/ResourceView";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";

@Component({
    selector: "widgets-renderer",
    templateUrl: "./widgetsPartitionRenderer.html",
})
export class WidgetsPartitionRenderer extends PartitionRendererMultiRoot {

    @Input() partition: ResViewPartition;
    addBtnImgSrc = "./assets/images/icons/actions/property_create.png";

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }


    ngOnInit() {
        super.ngOnInit();
    }

    //@Override
    getPredicateToEnrich(): Observable<ARTURIResource> {
        return null;
        // let predicatesIRI: string[] = VBContext.getWorkingProjectCtx().getProjectSettings().resourceView.customSections[this.partition].matchedProperties;
        // this.rootProperties = predicatesIRI.map(p => new ARTURIResource(p, null, RDFResourceRolesEnum.property));
        // if (this.rootProperties.length == 1) { //just one property => return it
        //     return of(this.rootProperties[0]);
        // } else {
        //     return from(
        //         this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, this.rootProperties).then(
        //             (selectedProp: ARTURIResource) => {
        //                 return selectedProp;
        //             },
        //             () => { 
        //                 return null;
        //             }
        //         )
        //     );
        // }
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.enrichProperty(predicate);
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            () => {
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }

}