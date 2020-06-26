import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource, ResAttribute } from "../../models/ARTResources";
import { ResourceViewConceptType } from '../../models/Properties';
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { RDFResourceRolesEnum } from './../../models/ARTResources';

@Component({
    selector: "resource-view",
    templateUrl: "./resourceViewContainer.html",
    host: { class: "vbox" },
    styleUrls: ["./resourceViewContainer.css"]
})
export class ResourceViewTabContainer {

    @Input() resource: ARTResource;

    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    private viewTypeResourceForm: string = "Resource Form";
    private viewTypeSimplifiedForm: string = "Simplified Form";
    private viewTypeSourceCode: string = "Source Code";
    private activeView: string = this.viewTypeResourceForm;

    private isTriplesEditorAvailable: boolean;
    private isSimplifiedFormAvailable: boolean;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            this.isTriplesEditorAvailable = (
                this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) &&
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesGetResourceTriplesDescription, this.resource)
            );
        }
        
        this.isSimplifiedFormAvailable = VBContext.getSystemSettings().experimentalFeaturesEnabled && this.resource.getRole() == RDFResourceRolesEnum.concept;
        //if the simplified form is available and it has been set as default for concept => activate it immediately
        if (this.isSimplifiedFormAvailable) {
            if (VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.defaultConceptType == ResourceViewConceptType.simplifiedForm) {
                this.activeView = this.viewTypeSimplifiedForm;
            }
        }
    }
    

    /**
     * EVENT LISTENERS
     */

    private onObjectDblClick(object: ARTResource) {
        this.dblclickObj.emit(object);
    }

    private onResourceUpdate(res: ARTResource) {
        this.update.emit(res);
    }

}