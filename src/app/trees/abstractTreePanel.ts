import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPanel } from "./abstractPanel";
import { CustomFormsServices } from "../services/customFormsServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { ModalServices } from "../widget/modal/modalServices";

@Component({
    selector: "panel",
    templateUrl: "./owl/classTreePanel/classTreePanelComponent.html", //placeholder template
})
export abstract class AbstractTreePanel extends AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    /**
     * ATTRIBUTES
     */


    /**
     * CONSTRUCTOR
     */
    constructor(cfService: CustomFormsServices, modalService: ModalServices) {
        super(cfService, modalService);
    }

    /**
     * METHODS
     */

    abstract createRoot(role?: RDFResourceRolesEnum): void;

    abstract createChild(): void;

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */

    onNodeSelected(node: ARTURIResource) {
        this.selectedNode = node;
        this.nodeSelected.emit(node);
    }

}