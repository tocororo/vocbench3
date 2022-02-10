import { Directive } from "@angular/core";
import { Observable, of } from "rxjs";
import { ARTURIResource } from "../../../models/ARTResources";
import { ResViewUtils } from "../../../models/ResourceView";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { PartitionRenderer } from "./partitionRenderer";

@Directive()
export abstract class PartitionRenderSingleRoot extends PartitionRenderer {

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices, 
        basicModals: BasicModalServices, creationModals: CreationModalServices, 
        resViewModals: ResViewModalServices) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }

    /**
     * ATTRIBUTES
     */

    /**
     * Root property described in the partition
     */
    protected rootProperty: ARTURIResource;

    /**
     * METHODS
     */

    ngOnInit() {
        super.ngOnInit();
        this.rootProperty = ResViewUtils.getPartitionRootProperties(this.partition)[0];
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return of(this.rootProperty);
    }

}