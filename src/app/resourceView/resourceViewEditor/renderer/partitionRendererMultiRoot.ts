import { Component, Directive } from "@angular/core";
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

    constructor(resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, resViewModals: ResViewModalServices) {
        super(resourcesService, cfService, basicModals, resViewModals);
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
    
    /**
     * Returns the title of the "+" button placed in a subPanel heading.
     * This is specific of a predicate of a partition, so it depends from a predicate.
     */
    private getAddPropImgTitle(predicate: ARTURIResource): string {
        return "Add a " + predicate.getShow();
    }
    /**
     * Returns the title of the "-" button placed near an object in a subPanel body.
     * This is specific of a predicate of a partition, so it depends from a predicate.
     */
    private getRemovePropImgTitle(predicate: ARTURIResource): string {
        return "Remove " + predicate.getShow();
    }

}