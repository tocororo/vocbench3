import { Component } from "@angular/core";
import { GraphModalServices } from "../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { CustomFormsServices } from "../services/customFormsServices";
import { ResourcesServices } from "../services/resourcesServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { AbstractPanel } from "./abstractPanel";

@Component({})
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
    constructor(cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, resourceService, basicModals, graphModals, eventHandler, vbProp);
        this.graphModals = graphModals;
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