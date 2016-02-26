import {Component, Input, Output, EventEmitter, ViewChild} from "angular2/core";
import {PropertyTreeComponent} from "../propertyTree/propertyTreeComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {PropertyServices} from "../../services/propertyServices";
import {SearchServices} from "../../services/searchServices";

@Component({
	selector: "property-tree-panel",
	templateUrl: "app/src/property/propertyTreePanel/propertyTreePanelComponent.html",
	directives: [PropertyTreeComponent],
    providers: [PropertyServices, SearchServices],
})
export class PropertyTreePanelComponent {
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    @ViewChild(PropertyTreeComponent) viewChildTree: PropertyTreeComponent;
    
    private selectedProperty:ARTURIResource;
    
	constructor(private propService:PropertyServices, private searchService: SearchServices) {}
    
    private createProperty() {
        this.createPropertyForType("rdf:Property");
    }
    
    private createObjectProperty() {
        this.createPropertyForType("owl:ObjectProperty");
    }
    
    private createDatatypeProperty() {
        this.createPropertyForType("owl:DatatypeProperty");
    }
    
    private createAnnotationProperty() {
        this.createPropertyForType("owl:AnnotationProperty");
    }
    
    private createOntologyProperty() {
        this.createPropertyForType("owl:OntologyProperty");
    }
    
    private createPropertyForType(type) {
        var propertyName = prompt("Insert property name");
        if (propertyName == null) return;
        this.propService.addProperty(propertyName, type).subscribe(
            stResp => { },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            }
        );
    }
    
    private createSubProperty() {
        var propertyName = prompt("Insert property name");
        if (propertyName == null) return;
        this.propService.addSubProperty(propertyName, this.selectedProperty).subscribe(
            stResp => { },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            }
        );
    }
    
    private deleteProperty() {
        this.propService.removeProperty(this.selectedProperty).subscribe(
            stResp => {
                this.selectedProperty = null;
                this.itemSelected.emit(undefined);
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            }
        );
    }
    
    private doSearch(searchedText: string) {
        this.searchService.searchResource(searchedText, ["property"], true, "contain").subscribe(
            searchResult => {
                if (searchResult.length == 0) {
                    alert("No results found for '" + searchedText + "'");
                } else if (searchResult.length == 1) {
                    this.viewChildTree.openTreeAt(searchResult[0]);
                } else {
                    //modal dialog still not available, so it's not possible to let the user choose which result prefer
                    alert(searchResult.length + " results found. This function is currently not available for multiple results");
                }
                
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            });
    }
    
    /**
     * Handles the keypress event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(keyIdentifier, searchedText) {
        if (keyIdentifier == "Enter") {
            if (searchedText.trim() == "") {
                alert("Please enter a valid string to search");
            } else {
                this.doSearch(searchedText);           
            }
        }
    }
    
    //EVENT LISTENERS
    
    private onNodeSelected(node:ARTURIResource) {
        this.selectedProperty = node;
        this.itemSelected.emit(node);
    }
    
    
}