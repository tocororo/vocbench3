import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { CustomForm, CustomFormValue } from "../../../models/CustomForms";
import { ResViewUtils } from "../../../models/ResourceView";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { AddPropertyValueModalReturnData } from "../resViewModals/addPropertyValueModal";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { MultiActionFunction } from "./multipleActionHelper";
import { PartitionRenderer } from "./partitionRenderer";
import { EnrichmentType, PropertyEnrichmentHelper, PropertyEnrichmentInfo } from "./propertyEnrichmentHelper";

@Component({
    selector: "partition-renderer-single",
    templateUrl: "./partitionRenderer.html",
})
export abstract class PartitionRenderSingleRoot extends PartitionRenderer {

    protected propService: PropertyServices;
    protected browsingModals: BrowsingModalServices;
    protected creationModals: CreationModalServices;
    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices, 
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModalService: ResViewModalServices) {
        super(resourcesService, cfService, basicModals, resViewModalService);
        this.propService = propService;
        this.creationModals = creationModal;
        this.browsingModals = browsingModals;
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
        return Observable.of(this.rootProperty);
    }


    /**
     * Given a predicate, chech how to enrich it and call the dedicated handler.
     * This is called only in those case where the predicate has not a known dedicated handler
     * (e.g. it is not known how to enrich skos:note since it has no range, while for instance skos:broader is enriched by selecting a concept)
     * @param predicate
     */
    enrichProperty(predicate: ARTURIResource) {
        PropertyEnrichmentHelper.getPropertyEnrichmentInfo(predicate, this.propService, this.basicModals).subscribe(
            (data: PropertyEnrichmentInfo) => {
                if (data.type == EnrichmentType.resource) {
                    this.enrichWithResource(predicate);
                } else if (data.type == EnrichmentType.literal) {
                    this.enrichWithTypedLiteral(predicate, data.allowedDatatypes, data.dataRanges);
                } else if (data.type == EnrichmentType.customForm) {
                    this.enrichWithCustomForm(predicate, data.form);
                }
            }
        )
    }

    public enrichWithCustomForm(predicate: ARTURIResource, form: CustomForm) {
        this.resViewModals.enrichCustomForm("Add " + predicate.getShow(), form.getId()).then(
            (entryMap: any) => {
                let cfValue: CustomFormValue = new CustomFormValue(form.getId(), entryMap);
                this.getAddPartitionAware(this.resource, predicate, cfValue).subscribe(() => this.update.emit());
            },
            () => { }
        )
    }

    /**
     * Opens a newTypedLiteral modal to enrich the predicate with a typed literal value 
     */
    private enrichWithTypedLiteral(predicate: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[]) {
        this.creationModals.newTypedLiteral("Add " + predicate.getShow(), predicate, allowedDatatypes, dataRanges, true, true).then(
            (literals: ARTLiteral[]) => {
                let addFunctions: MultiActionFunction[] = [];
                literals.forEach((l: ARTLiteral) => {
                    addFunctions.push({
                        function: this.getAddPartitionAware(this.resource, predicate, l),
                        value: l
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    /**
     * Opens a modal to enrich the predicate with a resource 
     */
    private enrichWithResource(predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add " + predicate.getShow(), this.resource, predicate, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: MultiActionFunction[] = [];
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push({
                        function: this.getAddPartitionAware(this.resource, prop, v),
                        value: v
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        )
    }

    /**
     * This represents the specific partition implementation for the add. 
     * By default it is Resource.addValue(...), but it could be override in a partition if it has a specific implementation 
     * (like in notes partition for which exists the addNote service that accept a SpecialValue as value)
     * @param resource
     * @param predicate 
     * @param value 
     */
    protected getAddPartitionAware(resource: ARTResource, predicate: ARTURIResource, value: ARTNode | CustomFormValue): Observable<void> {
        return this.resourcesService.addValue(resource, predicate, value);
    }

}