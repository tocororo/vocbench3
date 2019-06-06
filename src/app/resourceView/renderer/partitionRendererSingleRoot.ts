import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { CustomForm, CustomFormValue } from "../../models/CustomForms";
import { ResViewUtils } from "../../models/ResourceView";
import { CustomFormsServices } from "../../services/customFormsServices";
import { PropertyServices } from "../../services/propertyServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { AddPropertyValueModalReturnData } from "../resViewModals/addPropertyValueModal";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { MultiAddFunction } from "./multipleAddHelper";
import { PartitionRenderer } from "./partitionRenderer";
import { PropertyEnrichmentHelper, PropertyEnrichmentInfo } from "./propertyEnrichmentHelper";

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
     * Given a predicate, chech how to enrich it and call the dedicated handler
     * @param predicate
     */
    enrichProperty(predicate: ARTURIResource) {
        PropertyEnrichmentHelper.getPropertyEnrichmentInfo(predicate, this.propService, this.basicModals).subscribe(
            (data: PropertyEnrichmentInfo) => {
                if (data.type == "resource") {
                    this.enrichWithResource(predicate);
                } else if (data.type == "plainLiteral") {
                    this.enrichWithPlainLiteral(predicate);
                } else if (data.type == "typedLiteral") {
                    this.enrichWithTypedLiteral(predicate, data.allowedDatatypes, data.dataRanges);
                } else if (data.type == "customForm") {
                    this.enrichWithCustomForm(predicate, data.form);
                }
            }
        )
    }

    private enrichWithCustomForm(predicate: ARTURIResource, form: CustomForm) {
        this.resViewModals.enrichCustomForm("Add " + predicate.getShow(), form.getId()).then(
            (entryMap: any) => {
                let cfValue: CustomFormValue = new CustomFormValue(form.getId(), entryMap);
                this.addPartitionAware(this.resource, predicate, cfValue);
            },
            () => { }
        )
    }

    /**
     * Opens a newPlainLiteral modal to enrich the predicate with a plain literal value 
     */
    private enrichWithPlainLiteral(predicate: ARTURIResource) {
        this.creationModals.newPlainLiteral("Add " + predicate.getShow(), null, null, null, null, null, { enabled: true, allowSameLang: true }).then(
            (literal: ARTLiteral[]) => {
                let addFunctions: MultiAddFunction[] = [];
                literal.forEach((l: ARTLiteral) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(<ARTURIResource>this.resource, predicate, l),
                        value: l
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    /**
     * Opens a newTypedLiteral modal to enrich the predicate with a typed literal value 
     */
    private enrichWithTypedLiteral(predicate: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[]) {
        this.creationModals.newTypedLiteral("Add " + predicate.getShow(), predicate, allowedDatatypes, dataRanges, true).then(
            (literals: ARTLiteral[]) => {
                let addFunctions: MultiAddFunction[] = [];
                literals.forEach((l: ARTLiteral) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(<ARTURIResource>this.resource, predicate, l),
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
                let addFunctions: MultiAddFunction[] = [];
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push({
                        function: this.resourcesService.addValue(<ARTURIResource>this.resource, prop, v),
                        value: v
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        )
    }

    /**
     * This represents the specific partition implementation for the add. It could be override in a partition if it has
     * a specific implementation (like in notes partition for which exists the addNote service that accept a SpecialValue as value)
     * @param resource
     * @param predicate 
     * @param value 
     */
    addPartitionAware(resource: ARTResource, predicate: ARTURIResource, value: ARTNode | CustomFormValue) {
        this.resourcesService.addValue(resource, predicate, value).subscribe(
            stResp => this.update.emit()
        );
    }

}