import { GraphModalServices } from "../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { CustomFormsServices } from "../services/customFormsServices";
import { ResourcesServices } from "../services/resourcesServices";
import { ActionDescription, RoleActionResolver } from "../utils/RoleActionResolver";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { AbstractPanel } from "./abstractPanel";
import { MultiSubjectEnrichmentHelper } from "./multiSubjectEnrichmentHelper";

export abstract class AbstractListPanel extends AbstractPanel {

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

    executeAction(act: ActionDescription, role?: RDFResourceRolesEnum) {
        act.function(this.getActionContext(role), this.selectedNode).subscribe(
            done => {
                if (act.conditions.post.deselectOnComplete) {
                    this.selectedNode = null;
                };
            },
            cancel => {}
        );
    }

    abstract openAt(node: ARTURIResource): void;
    
}