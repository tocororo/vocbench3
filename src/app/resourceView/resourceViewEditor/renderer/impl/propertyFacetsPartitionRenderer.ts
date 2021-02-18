import { Component, Input } from "@angular/core";
import { Observable, of } from "rxjs";
import { ARTNode, ARTURIResource, ResAttribute } from "../../../../models/ARTResources";
import { AddAction, PropertyFacet, PropertyFacetsEnum, ResViewPartition } from "../../../../models/ResourceView";
import { OWL, RDF } from "../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { CRUDEnum, ResourceViewAuthEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../../../utils/ResourceUtils";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { AddPropertyValueModalReturnData } from "../../resViewModals/addPropertyValueModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "property-facets-renderer",
    templateUrl: "./propertyFacetsPartitionRenderer.html",
})
export class PropertyFacetsPartitionRenderer extends PartitionRenderSingleRoot {

    @Input('facets') facets: PropertyFacet[];

    AddAction = AddAction; //workaround for using enum in template

    partition = ResViewPartition.facets;
    addBtnImgSrc = "./assets/images/icons/actions/property_create.png";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue({key:"DATA.ACTIONS.ADD_INVERSE_PROPERTY"}, this.resource, predicate, propChangeable).then(
            (data: AddPropertyValueModalReturnData) => {
                let prop: ARTURIResource = data.property;
                let inverse: boolean = data.inverseProperty;
                let values: ARTURIResource[] = data.value;

                let addFunctions: MultiActionFunction[] = [];
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
        return of(value instanceof ARTURIResource);
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

    /**
     * In this partition, the edit is delegated only for the ObjectProperty expression (manchester) inside the inverseOf pred-objects panel
     */
    editHandler(predicate: ARTURIResource, object: ARTNode) {
        this.resViewModals.addPropertyValue({key:"DATA.ACTIONS.SET_INVERSE_PROPERTY"}, this.resource, predicate, false).then(
            (data: AddPropertyValueModalReturnData) => {
                //first remove the previous value
                this.getRemoveFunctionImpl(predicate, object).subscribe(
                    () => {
                        //then add the new value
                        let prop: ARTURIResource = data.property;
                        let inverse: boolean = data.inverseProperty;
                        let values: ARTURIResource[] = data.value;
                        let addFunctions: MultiActionFunction[] = [];
                        values.forEach((v: ARTURIResource) => {
                            addFunctions.push({
                                function: this.propService.addInverseProperty(<ARTURIResource>this.resource, v, prop, inverse),
                                value: v
                            });
                        });
                        this.addMultiple(addFunctions);
                    }
                );
            },
            () => { }
        );
    }

}