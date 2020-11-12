import { Directive } from '@angular/core';
import { GraphModalServices } from "../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../models/ARTResources";
import { CustomFormsServices } from "../services/customFormsServices";
import { ResourcesServices } from "../services/resourcesServices";
import { ActionDescription, RoleActionResolver } from "../utils/RoleActionResolver";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalType } from '../widget/modal/Modals';
import { AbstractPanel } from "./abstractPanel";
import { MultiSubjectEnrichmentHelper } from "./multiSubjectEnrichmentHelper";

@Directive()
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
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper) {
        super(cfService, resourceService, basicModals, graphModals, eventHandler, vbProp, actionResolver, multiEnrichment);
    }

    /**
     * METHODS
     */

    // abstract createRoot(role?: RDFResourceRolesEnum): void;
    // abstract createChild(role?: RDFResourceRolesEnum): void;

    executeAction(act: ActionDescription, role?: RDFResourceRolesEnum) {
        if (act.conditions.pre.selectionRequired && act.conditions.pre.childlessRequired && this.selectedNode.getAdditionalProperty(ResAttribute.MORE)) {
            this.basicModals.alert("Operation denied", "The operation cannot be done on node with children. Please delete the children nodes and then retry", ModalType.warning);
            return;
        }
        act.function(this.getActionContext(role), this.selectedNode).subscribe(
            done => {
                if (act.conditions.post.deselectOnComplete) {
                    this.selectedNode = null;
                };
            },
            cancel => {}
        );
    }


    abstract openTreeAt(node: ARTURIResource): void;

    //the following determines if the create button is disabled in the UI. It could be overriden in the extending components
    // isCreateChildDisabled(): boolean {
    //     return (!this.selectedNode || this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    // }

}