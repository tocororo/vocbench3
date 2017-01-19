import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPredicateObjectsListRenderer } from "./abstractPredicateObjectsListRenderer";
import { PropertyServices } from "../../services/propertyServices";
import { CustomRangeServices } from "../../services/customRangeServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../utils/ARTResources";
import { RDF, OWL } from "../../utils/Vocabulary";

@Component({
    selector: "property-facets-renderer",
    templateUrl: "./propertyFacetsPartitionRenderer.html",
})
export class PropertyFacetsPartitionRenderer extends AbstractPredicateObjectsListRenderer {

    @Input('facets') facets: any[]; // array of data structure {name: string, explicit: boolean, value: boolean}
    //inherited from AbstractPredicateObjectsListRenderer
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    rootProperty: ARTURIResource = OWL.inverseOf;
    label = "Property facets";
    addBtnImgTitle = "Add a inverse property";
    addBtnImgSrc = require("../../../assets/images/prop_create.png");
    removeBtnImgTitle = "Remove inverse property";

    constructor(private propService: PropertyServices, private crService: CustomRangeServices,
        private rvModalService: ResViewModalServices) {
        super();
    }

    add(predicate?: ARTURIResource) {
        var propChangeable: boolean = predicate == null;
        this.rvModalService.addPropertyValue("Add an inverse property", this.resource, this.rootProperty, propChangeable).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var inverseProp: ARTURIResource = data.value;
                this.propService.addExistingPropValue(this.resource, prop, inverseProp.getURI(), RDFTypesEnum.resource).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => { }
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            this.propService.removePropValue(<ARTURIResource>this.resource, predicate, object.getNominalValue(), null, RDFTypesEnum.uri).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }

    private changeFacet(facetName: string, checked: boolean) {
        if (facetName == "symmetric") {
            this.setPropertyFacet(OWL.symmetricProperty, checked);
        } else if (facetName == "functional") {
            this.setPropertyFacet(OWL.functionalProperty, checked);
        } else if (facetName == "inverseFunctional") {
            this.setPropertyFacet(OWL.inverseFunctionalProperty, checked);
        } else if (facetName == "transitive") {
            this.setPropertyFacet(OWL.transitiveProperty, checked);
        }
    }

    private setPropertyFacet(propertyClass: ARTURIResource, value: boolean) {
        if (value) {
            this.propService.addExistingPropValue(this.resource, RDF.type, propertyClass.getURI(), RDFTypesEnum.uri).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            this.propService.removePropValue(<ARTURIResource>this.resource, RDF.type, propertyClass.getURI(), null, RDFTypesEnum.uri).subscribe(
                stResp => this.update.emit(null)
            );
        }
    }

}