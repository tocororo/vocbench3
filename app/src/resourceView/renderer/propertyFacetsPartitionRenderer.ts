import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RDF, OWL} from "../../utils/Vocabulary";
import {RDFTypesEnum} from "../../utils/Enums";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "property-facets-renderer",
	templateUrl: "app/src/resourceView/renderer/propertyFacetsPartitionRenderer.html",
	directives: [RdfResourceComponent],
    providers: [PropertyServices],
})
export class PropertyFacetsPartitionRenderer {
    
    @Input('object-list') objectList: ARTURIResource[];
    @Input('facets') facets: any[]; /** array of data structure {name: string, explicit: boolean, value: boolean}, 
            name of the facet (symmetric/functional/inverseFunctional), if the info is explicit, the value (true/false) */
    @Input() resource: ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    constructor(private propService:PropertyServices, private browsingService: BrowsingServices) {}
    
    private add() {
        this.browsingService.browsePropertyTree("Select an inverse property").then(
            selectedProp => {
                this.propService.addExistingPropValue(this.resource, OWL.inverseOf, selectedProp.getURI(), RDFTypesEnum.resource).subscribe(
                    stResp => this.update.emit(null)
                )
            }
        )
    }
    
    private remove(property: ARTURIResource) {
        this.propService.removePropValue(this.resource, OWL.inverseOf, property.getURI(), null, RDFTypesEnum.uri).subscribe(
            stResp => {
                this.update.emit(null);
            },
            err => { }
        );
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
                stResp => this.update.emit(null),
                err => { }
            );
        } else {
            this.propService.removePropValue(this.resource, RDF.type, propertyClass.getURI(), null, RDFTypesEnum.uri).subscribe(
                stResp => this.update.emit(null),
                err => { }
            );
        }
    }
    
}