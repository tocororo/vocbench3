import { Component, EventEmitter, Output } from "@angular/core";
import { ARTNode, ARTPredicateObjects, ARTResource, ResAttribute } from "../../../models/ARTResources";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { CRUDEnum, ResourceViewAuthEvaluator } from "../../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../../utils/ResourceUtils";
import { AbstractResViewResource } from "./abstractResViewResource";

@Component({
	selector: "reified-resource",
    templateUrl: "./reifiedResourceComponent.html",
    host: { class: "hbox" }
})
export class ReifiedResourceComponent extends AbstractResViewResource {
    
    private predicateObjectList: ARTPredicateObjects[];

    private actionRemoveTitle: string;
    private deleteDisabled: boolean = false;
    private open: boolean = false;
	
    constructor(private cfService: CustomFormsServices) {
        super();
    }
    
    ngOnInit() {
        /**
         * Delete is disabled if one of them is true
         * - resource is not explicit (e.g. imported, inferred, in staging)
         * - resource is in a staging status (staging-add or staging-remove)
         * - ResView is working in readonly mode
         * - user not authorized
         */
        this.deleteDisabled = !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
            ResourceUtils.isResourceInStaging(this.subject) ||
            this.readonly || !ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.D, this.subject);

        this.actionRemoveTitle = "Remove " + this.predicate.getShow();
    }
    
    private toggle() {
        if (this.predicateObjectList == null) {
            this.cfService.getGraphObjectDescription(this.predicate, this.resource).subscribe(
                graphDescr => {
                    this.predicateObjectList = graphDescr;
                    this.open = !this.open;
                    /**
                     * if expanded resource has no description, set the NOT_REIFIED attr to true, 
                     * so in the resview-value-renderer it is rendered as simple editable-resource and no more 
                     * as reified resource
                     */
                    if (this.predicateObjectList == null || this.predicateObjectList.length == 0) { 
                        this.resource.setAdditionalProperty(ResAttribute.NOT_REIFIED, true);
                    }
                }
            );
        } else {
            this.open = !this.open;
        }
    }

    //double click on an object of expanded reified res description
    private objectDblClick(object: ARTNode) {
        if (object.isResource()) {
            this.dblClick.emit(<ARTResource>object);
        }
    }

}