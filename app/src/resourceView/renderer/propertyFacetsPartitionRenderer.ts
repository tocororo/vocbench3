import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "property-facets-renderer",
	templateUrl: "app/src/resourceView/renderer/propertyFacetsRenderer.html",
	directives: [RdfResourceComponent],
    providers: [PropertyServices],
})
export class PropertyFacetsPartitionRenderer {
    
    @Input('object-list') objectList: ARTURIResource[];
    @Input('facets') facets: any[]; /** array of data structure {name: string, explicit: boolean, value: boolean}, 
            name of the facet (symmetric/functional/inverseFunctional), if the info is explicit, the value (true/false) */
    @Input() resource: ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private rdfType: ARTURIResource = new ARTURIResource("http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "rdf:type", "property");
    private inverseOf: ARTURIResource = new ARTURIResource("http://www.w3.org/2002/07/owl#inverseOf", "rdf:type", "property");
    
    constructor(private propService:PropertyServices, private modalService: ModalServices,
        private browsingService: BrowsingServices) {}
    
    private add() {
        this.browsingService.browsePropertyTree("Select an inverse property").then(
            selectedProp => {
                this.propService.addExistingPropValue(this.resource, this.inverseOf, selectedProp.getURI(), "resource").subscribe(
                    stResp => this.update.emit(null)
                )
            }
        )
    }
    
    private remove(property: ARTURIResource) {
        this.propService.removePropValue(this.resource, this.inverseOf, property.getURI(), null, "uri").subscribe(
            stResp => {
                this.update.emit(null);
            },
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err.stack);
            }
        );
    }
    
    private changeFacet(facetName: string, checked: boolean) {
        if (facetName == "symmetric") {
            this.setPropertyFacet("http://www.w3.org/2002/07/owl#SymmetricProperty", checked);
        } else if (facetName == "functional") {
            this.setPropertyFacet("http://www.w3.org/2002/07/owl#FunctionalProperty", checked);
        } else if (facetName == "inverseFunctional") {
            this.setPropertyFacet("http://www.w3.org/2002/07/owl#InverseFunctionalProperty", checked);
        } else if (facetName == "transitive") {
            this.setPropertyFacet("http://www.w3.org/2002/07/owl#TransitiveProperty", checked);
        }
    }
    
    private setPropertyFacet(propertyClass: string, value: boolean) {
        if (value) {
            this.propService.addExistingPropValue(this.resource, this.rdfType, propertyClass, "uri").subscribe(
                stResp => this.update.emit(null),
                err => {
                    this.modalService.alert("Error", err, "error");
                    console.error(err.stack);
                }
            );
        } else {
            this.propService.removePropValue(this.resource, this.rdfType, propertyClass, null, "uri").subscribe(
                stResp => this.update.emit(null),
                err => {
                    this.modalService.alert("Error", err, "error");
                    console.error(err.stack);
                }
            );
        }
    }
    
}