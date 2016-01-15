import {Component, Input} from "angular2/core";
import {PropertyTreeComponent} from "../../tree/propertyTree/PropertyTreeComponent";
import {ARTURIResource} from "../../utils/ARTResources";

@Component({
	selector: "property-tree-panel",
	templateUrl: "app/src/property/propertyTreePanel/propertyTreePanelComponent.html",
	directives: [PropertyTreeComponent]
})
export class PropertyTreePanelComponent {
    private selectedProperty:ARTURIResource;
    
	constructor() {}
    
    createProperty() {
        alert("create property");
    }
    
    createObjectProperty() {
        alert("create object property");
    }
    
    createDatatypeProperty() {
        alert("create datatype property");
    }
    
    createAnnotationProperty() {
        alert("create annotation property");
    }
    
    createOntologyProperty() {
        alert("create ontology property");
    }
    
    /* the following methods still cannot be used 'cause to selectedClass should be updated 
       through event emitted from. Need to understand how to emit/broadcast event in NG2 */ 
    createSubProperty() {
        alert("create subProperty of..." + JSON.stringify(this.selectedProperty));
    }
    
    deleteClass() {
        alert("delete Property..." + JSON.stringify(this.selectedProperty));
    }
    
}