import { Component, Input, Output, EventEmitter } from "@angular/core";
import { PropertyTreeComponent } from "../propertyTree/propertyTreeComponent";
import { ARTURIResource, RDFResourceRolesEnum } from "../../utils/ARTResources";
import { PropertyServices } from "../../services/propertyServices";
import { DeleteServices } from "../../services/deleteServices";
import { ModalServices } from "../../widget/modal/modalServices";

@Component({
    selector: "property-tree-panel",
    templateUrl: "./propertyTreePanelComponent.html",
})
export class PropertyTreePanelComponent {
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

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
        this.modalService.prompt("Create a new " + type, "Name", null, false, true).then(
            result => {
                this.propService.addProperty(result, type).subscribe();
            },
            () => { }
        );
    }

    private createSubProperty() {
        //currently uses prompt instead of newResource since addSubProperty service doesn't allow to provide a label
        this.modalService.prompt("Create a subProperty", "Name", null, false, true).then(
            result => {
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

    //EVENT LISTENERS

    private onNodeSelected(node: ARTURIResource) {
        this.selectedProperty = node;
        this.nodeSelected.emit(node);
    }


}