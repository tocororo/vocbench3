import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { PropertyTreeComponent } from "../propertyTree/propertyTreeComponent";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { PropertyServices } from "../../../services/propertyServices";
import { DeleteServices } from "../../../services/deleteServices";
import { ModalServices } from "../../../widget/modal/modalServices";

@Component({
    selector: "property-tree-panel",
    templateUrl: "./propertyTreePanelComponent.html",
})
export class PropertyTreePanelComponent {
    @Input() editable: boolean = true; //if true show the buttons to edit the tree
    @Input() resource: ARTURIResource;//provide to show just the properties with domain the type of the resource
    @Input('roots') rootProperties: ARTURIResource[]; //in case the roots are provided to the component instead of being retrieved from server
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    @ViewChild(PropertyTreeComponent) viewChildTree: PropertyTreeComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedProperty: ARTURIResource;

    constructor(private propService: PropertyServices, private deleteService: DeleteServices,
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
        this.viewChildTree.initTree();
    }

    //EVENT LISTENERS

    private onNodeSelected(node: ARTURIResource) {
        this.selectedProperty = node;
        this.nodeSelected.emit(node);
    }


}