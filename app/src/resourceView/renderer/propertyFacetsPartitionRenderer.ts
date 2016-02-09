import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
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
    @Output() update = new EventEmitter();
    
    public label = "Property facets";
    public addBtnImgSrc = "app/assets/images/prop_create.png";
    public addBtnImgTitle = "Add a inverse property";
    public removeBtnImgSrc = "app/assets/images/prop_delete.png";
    public removeBtnImgTitle = "Remove inverse property";
    
    private rdfTypeUri = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    private inverseOfUri = "http://www.w3.org/2002/07/owl#inverseOf";
    
    constructor(private propService:PropertyServices) {}
    
    public add() {
        alert("add inverse property to " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public remove(property: ARTURIResource) {
        this.propService.removePropValue(this.resource.getURI(), this.inverseOfUri, property.getURI(), null, "uri")
            .subscribe(
                stResp => {
                    this.update.emit(null);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
    public changeFacet(facetName: string, checked: boolean) {
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
            this.propService.addExistingPropValue(this.resource.getURI(), this.rdfTypeUri, propertyClass, "uri")
                .subscribe(
                    stResp => this.update.emit(null),
                    err => {
                        alert("Error: " + err);
                        console.error(err.stack);
                    }
                );
        } else {
            this.propService.removePropValue(this.resource.getURI(), this.rdfTypeUri, propertyClass, null, "uri")
                .subscribe(
                    stResp => this.update.emit(null),
                    err => {
                        alert("Error: " + err);
                        console.error(err.stack);
                    }
                );
        }
    }
    
}