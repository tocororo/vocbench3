import { Component, Input } from "@angular/core";
import { from, Observable, of } from "rxjs";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { ARTNode, ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { VBContext } from "../../../../utils/VBContext";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";

@Component({
    selector: "custom-partition-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class CustomPartitionRenderer extends PartitionRendererMultiRoot {

    @Input() partition: ResViewPartition;
    addBtnImgSrc = "./assets/images/icons/actions/property_create.png";

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices, cvService: CustomViewsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        private browsingModals: BrowsingModalServices) {
        super(resourcesService, propService, cfService, cvService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    //@Override
    getPredicateToEnrich(): Observable<ARTURIResource> {
        let predicatesIRI: string[] = VBContext.getWorkingProjectCtx().getProjectSettings().resourceView.customSections[this.partition].matchedProperties;
        this.rootProperties = predicatesIRI.map(p => new ARTURIResource(p, null, RDFResourceRolesEnum.property));
        if (this.rootProperties.length == 1) { //just one property => return it
            return of(this.rootProperties[0]);
        } else {
            return from(
                this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, this.rootProperties).then(
                    (selectedProp: ARTURIResource) => {
                        return selectedProp;
                    },
                    () => { 
                        return null;
                    }
                )
            );
        }
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