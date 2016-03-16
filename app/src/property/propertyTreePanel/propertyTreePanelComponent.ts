import {Component, Input, Output, EventEmitter, ViewChild} from "angular2/core";
import {PropertyTreeComponent} from "../propertyTree/propertyTreeComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {PropertyServices} from "../../services/propertyServices";
import {SearchServices} from "../../services/searchServices";
import {ModalServices} from "../../widget/modal/modalServices";

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
    
	constructor(private propService:PropertyServices, private searchService: SearchServices, private modalService: ModalServices) {}
    
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
        //currently uses prompt instead of newResource since addProperty service doesn't allow to provide a label
        this.modalService.prompt("Create a new " + type, "Name", true).then(
            result => {
                this.propService.addProperty(result, type).subscribe(
                    stResp => { },
                    err => {
                        this.modalService.alert("Error", err, "error");
                        console.error(err['stack']);
                    }
                );
            }
        );
    }
    
    private createSubProperty() {
        //currently uses prompt instead of newResource since addSubProperty service doesn't allow to provide a label
        this.modalService.prompt("Create a subProperty", "Name", true).then(
            result => {
                this.propService.addSubProperty(result, this.selectedProperty).subscribe(
                    stResp => { },
                    err => {
                        this.modalService.alert("Error", err, "error");
                        console.error(err['stack']);
                    }
                );
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
                this.modalService.alert("Error", err, "error");
                console.error(err['stack']);
            }
        );
    }
    
    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, ["property"], true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'");
                    } else if (searchResult.length == 1) {
                        this.viewChildTree.openTreeAt(searchResult[0]);
                    } else {
                        //modal dialog still not available, so it's not possible to let the user choose which result prefer
                        alert(searchResult.length + " results found. This function is currently not available for multiple results");
                    }
                    
                },
                err => {
                    this.modalService.alert("Error", err, "error");
                    console.error(err['stack']);
                }
            );
        }
        
    }
    
    /**
     * Handles the keypress event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(keyIdentifier, searchedText) {
        if (keyIdentifier == "Enter") {
            this.doSearch(searchedText);           
        }
    }
    
    //EVENT LISTENERS
    
    private onNodeSelected(node:ARTURIResource) {
        this.selectedProperty = node;
        this.itemSelected.emit(node);
    }
    
    
}