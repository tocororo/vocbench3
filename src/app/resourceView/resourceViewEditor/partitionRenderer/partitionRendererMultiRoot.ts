import { Directive } from "@angular/core";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { ARTURIResource } from "../../../models/ARTResources";
import { ResViewUtils } from "../../../models/ResourceView";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { PartitionRenderer } from "./partitionRenderer";

@Directive()
export abstract class PartitionRendererMultiRoot extends PartitionRenderer  {

    /**
     * ATTRIBUTES
     */

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices, cvService: CustomViewsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices) {
        super(resourcesService, propService, cfService, cvService, basicModals, creationModals, resViewModals);
    }

    /**
     * Root properties described in the partition.
     * Note that this differs from wellKnownProperties from because this should only contains root properties
     * (those properties that has no super properties among the known properties) not all the known properties
     * (e.g. rdfs:label, skos(xl):pref/alt/hiddenLabel for lexicalizations partition)
     */
    protected rootProperties: ARTURIResource[];
    /**
     * Properties described in the partition for which exists dedicated add/remove services
     * (e.g. rdfs:label, skos(xl):pref/alt/hiddenLabel for lexicalizations partition)
     */
    protected knownProperties: ARTURIResource[];

    /**
     * METHODS
     */

    ngOnInit() {
        super.ngOnInit();
        this.rootProperties = ResViewUtils.getPartitionRootProperties(this.partition);
        this.knownProperties = ResViewUtils.getPartitionKnownProperties(this.partition);
    }

    //used in removePredicateObject to know if the removing object is about a well known property
    isKnownProperty(predicate: ARTURIResource): boolean {
        for (var i = 0; i < this.knownProperties.length; i++) {
            if (this.knownProperties[i].getURI() == predicate.getURI()) {
                return true;
            }
        }
        return false;
    }
    
}