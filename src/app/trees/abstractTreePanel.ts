import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AbstractPanel } from "./abstractPanel";
import { CustomFormsServices } from "../services/customFormsServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";

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
    constructor(cfService: CustomFormsServices, basicModals: BasicModalServices, eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, basicModals, eventHandler, vbProp);
    }

    /**
     * METHODS
     */

    abstract createRoot(role?: RDFResourceRolesEnum): void;
    abstract createChild(role?: RDFResourceRolesEnum): void;

    abstract openTreeAt(node: ARTURIResource): void;

    //the following determines if the create button is disabled in the UI. It could be overriden in the extending components
    isCreateChildDisabled(): boolean {
        return (!this.selectedNode || this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    }

}