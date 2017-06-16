import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPanel } from "./abstractPanel";
import { CustomFormsServices } from "../services/customFormsServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

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
    constructor(cfService: CustomFormsServices, basicModals: BasicModalServices) {
        super(cfService, basicModals);
    }

    /**
     * METHODS
     */

    abstract createRoot(role?: RDFResourceRolesEnum): void;
    abstract createChild(role?: RDFResourceRolesEnum): void;

    //the following determines if the create button is disabled in the UI. It could be overriden in the extending components
    isCreateChildDisabled(): boolean {
        return (!this.selectedNode || this.readonly || !this.createAuthorized);
    }

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */

    onNodeSelected(node: ARTURIResource) {
        this.selectedNode = node;
        this.nodeSelected.emit(node);
    }

}