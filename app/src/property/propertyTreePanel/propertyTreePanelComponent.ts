import {Component, Input, Output, EventEmitter, ViewChild} from "@angular/core";
import {PropertyTreeComponent} from "../propertyTree/propertyTreeComponent";
import {ARTURIResource} from "../../utils/ARTResources";
import {RDFResourceRolesEnum} from "../../utils/Enums";
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
        this.modalService.prompt("Create a new " + type, "Name", null, false, true).then(
            result => {
                this.propService.addProperty(result, type).subscribe();
            },
            () => {}
        );
    }
    
    private createSubProperty() {
        //currently uses prompt instead of newResource since addSubProperty service doesn't allow to provide a label
        this.modalService.prompt("Create a subProperty", "Name", null, false, true).then(
            result => {
                this.propService.addSubProperty(result, this.selectedProperty).subscribe();
            },
            () => {}
        );
    }
    
    private deleteProperty() {
        this.propService.removeProperty(this.selectedProperty).subscribe(
            stResp => {
                this.selectedProperty = null;
                this.itemSelected.emit(undefined);
            }
        );
    }
    
    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.property], true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.viewChildTree.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                selectedResource => {
                                    this.viewChildTree.openTreeAt(selectedResource);
                                },
                                () => {}
                            );
                        }
                    }
                }
            );
        }
    }
    
    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key, searchedText) {
        if (key == "13") {
            this.doSearch(searchedText);           
        }
    }
    
    //EVENT LISTENERS
    
    private onNodeSelected(node:ARTURIResource) {
        this.selectedProperty = node;
        this.itemSelected.emit(node);
    }
    
    
}