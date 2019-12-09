import { Component, Input } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { PropertyFacet, PropertyFacetsEnum, ResViewPartition } from "../../../models/ResourceView";
import { OWL, RDF } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { CRUDEnum, ResourceViewAuthEvaluator } from "../../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../../utils/ResourceUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { AddPropertyValueModalReturnData } from "../../resViewModals/addPropertyValueModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiAddFunction } from "../multipleAddHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "property-facets-renderer",
    templateUrl: "./propertyFacetsPartitionRenderer.html",
})
export class PropertyFacetsPartitionRenderer extends PartitionRenderSingleRoot {

    @Input('facets') facets: PropertyFacet[];

    partition = ResViewPartition.facets;
    addBtnImgTitle = "Add a inverse property";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/property_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add an inverse property", this.resource, predicate, propChangeable).then(
            (data: AddPropertyValueModalReturnData) => {
                let prop: ARTURIResource = data.property;
                let inverse: boolean = data.inverseProperty;
                let values: ARTURIResource[] = data.value;

                let addFunctions: MultiAddFunction[] = [];
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push({
                        function: this.propService.addInverseProperty(<ARTURIResource>this.resource, v, prop, inverse),
                        value: v
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit(null)
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.propService.removeInverseProperty(<ARTURIResource>this.resource, <ARTURIResource>object, predicate);
    }

    private changeFacet(facet: PropertyFacet) {
        if (facet.name == PropertyFacetsEnum.symmetric) {
            this.setPropertyFacet(OWL.symmetricProperty, facet.value);
        } else if (facet.name == PropertyFacetsEnum.asymmetric) {
            this.setPropertyFacet(OWL.asymmetricProperty, facet.value);
        } else if (facet.name == PropertyFacetsEnum.functional) {
            this.setPropertyFacet(OWL.functionalProperty, facet.value);
        } else if (facet.name == PropertyFacetsEnum.inverseFunctional) {
            this.setPropertyFacet(OWL.inverseFunctionalProperty, facet.value);
        } else if (facet.name == PropertyFacetsEnum.reflexive) {
            this.setPropertyFacet(OWL.reflexiveProperty, facet.value);
        } else if (facet.name == PropertyFacetsEnum.irreflexive) {
            this.setPropertyFacet(OWL.irreflexiveProperty, facet.value);
        } else if (facet.name == PropertyFacetsEnum.transitive) {
            this.setPropertyFacet(OWL.transitiveProperty, facet.value);
        }
    }

    private setPropertyFacet(propertyClass: ARTURIResource, value: boolean) {
        if (value) {
            this.resourcesService.addValue(this.resource, RDF.type, propertyClass).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            this.resourcesService.removeValue(<ARTURIResource>this.resource, RDF.type, propertyClass).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }

    private isChangeFacetDisabled(facet: PropertyFacet) {
        return (
            !facet.explicit ||
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isResourceInStagingAdd(this.resource)) ||
            this.readonly || !ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.U, this.resource)
        );
    }

}