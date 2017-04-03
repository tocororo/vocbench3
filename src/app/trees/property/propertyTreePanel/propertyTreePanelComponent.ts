import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { PropertyTreeComponent } from "../propertyTree/propertyTreeComponent";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { PropertyServices } from "../../../services/propertyServices";
import { DeleteServices } from "../../../services/deleteServices";
import { SearchServices } from "../../../services/searchServices";
import { ModalServices } from "../../../widget/modal/modalServices";

@Component({
    selector: "property-tree-panel",
    templateUrl: "./propertyTreePanelComponent.html",
})
export class PropertyTreePanelComponent {
    @Input() editable: boolean = true; //if true show the buttons to edit the tree
    @Input() resource: ARTURIResource;//provide to show just the properties with domain the type of the resource
    @Input() type: RDFResourceRolesEnum; //tells the type of the property to show in the tree
    @Input('roots') rootProperties: ARTURIResource[]; //in case the roots are provided to the component instead of being retrieved from server
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    @ViewChild(PropertyTreeComponent) viewChildTree: PropertyTreeComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedProperty: ARTURIResource;

    constructor(private propService: PropertyServices, private deleteService: DeleteServices, private searchService: SearchServices,
        private modalService: ModalServices) { }

    private createProperty() {
        this.createPropertyForType(RDFResourceRolesEnum.property);
    }

    private createObjectProperty() {
        this.createPropertyForType(RDFResourceRolesEnum.objectProperty);
    }

    private createDatatypeProperty() {
        this.createPropertyForType(RDFResourceRolesEnum.datatypeProperty);
    }

    private createAnnotationProperty() {
        this.createPropertyForType(RDFResourceRolesEnum.annotationProperty);
    }

    private createOntologyProperty() {
        this.createPropertyForType(RDFResourceRolesEnum.ontologyProperty);
    }

    private createPropertyForType(type: RDFResourceRolesEnum) {
        //currently uses prompt instead of newResource since addProperty service doesn't allow to provide a label
        this.modalService.prompt("Create a new " + type, "Name", null, null, false, true).then(
            (result: any) => {
                this.propService.addProperty(result, type).subscribe();
            },
            () => { }
        );
    }

    private createSubProperty() {
        //currently uses prompt instead of newResource since addSubProperty service doesn't allow to provide a label
        this.modalService.prompt("Create a subProperty", "Name", null, null, false, true).then(
            (result: any) => {
                this.propService.addSubProperty(result, this.selectedProperty).subscribe();
            },
            () => { }
        );
    }

    private deleteProperty() {
        this.deleteService.removeProperty(this.selectedProperty).subscribe(
            stResp => {
                this.selectedProperty = null;
                this.nodeSelected.emit(undefined);
            }
        );
    }

    private refresh() {
        this.selectedProperty = null;
        this.viewChildTree.initTree();
    }

    //search handlers

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.property], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.viewChildTree.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.viewChildTree.openTreeAt(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    //EVENT LISTENERS

    private onNodeSelected(node: ARTURIResource) {
        this.selectedProperty = node;
        this.nodeSelected.emit(node);
    }


}