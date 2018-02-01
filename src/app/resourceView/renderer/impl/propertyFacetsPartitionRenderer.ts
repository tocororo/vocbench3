import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum, ResourceUtils } from "../../../models/ARTResources";
import { RDF, OWL } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";

@Component({
    selector: "property-facets-renderer",
    templateUrl: "./propertyFacetsPartitionRenderer.html",
})
export class PropertyFacetsPartitionRenderer extends PartitionRenderSingleRoot {

    @Input('facets') facets: Facet[];
    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.facets;
    rootProperty: ARTURIResource = OWL.inverseOf;
    label = "Property facets";
    addBtnImgTitle = "Add a inverse property";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/prop_create.png");
    removeBtnImgTitle = "Remove inverse property";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addPropertyValue("Add an inverse property", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var inverseProp: ARTURIResource = data.value;
                this.resourcesService.addValue(this.resource, prop, inverseProp).subscribe(
                    stResp => this.update.emit(null)
                );
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
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }

    private changeFacet(facetName: string, checked: boolean) {
        if (facetName == "symmetric") {
            this.setPropertyFacet(OWL.symmetricProperty, checked);
        } else if (facetName == "asymmetric") {
            this.setPropertyFacet(OWL.asymmetricProperty, checked);
        } else if (facetName == "functional") {
            this.setPropertyFacet(OWL.functionalProperty, checked);
        } else if (facetName == "inverseFunctional") {
            this.setPropertyFacet(OWL.inverseFunctionalProperty, checked);
        } else if (facetName == "reflexive") {
            this.setPropertyFacet(OWL.reflexiveProperty, checked);
        } else if (facetName == "irreflexive") {
            this.setPropertyFacet(OWL.irreflexiveProperty, checked);
        } else if (facetName == "transitive") {
            this.setPropertyFacet(OWL.transitiveProperty, checked);
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

    private isChangeFacetDisabled(facet: Facet) {
        return (
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isReourceInStaging(this.resource)) ||
            this.readonly || !AuthorizationEvaluator.ResourceView.isEditAuthorized(this.partition, this.resource)
        );
    }

}

class Facet {
    name: string;
    value: boolean;
}