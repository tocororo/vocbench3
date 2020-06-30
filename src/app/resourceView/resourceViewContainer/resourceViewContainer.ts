import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource, ResAttribute } from "../../models/ARTResources";
import { ResourceViewPreference, ResourceViewType } from '../../models/Properties';
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

    private resourceFormStruct: ResViewStruct = { type: ResourceViewType.resourceView, show: "ResView" };
    private simplifiedFormStruct: ResViewStruct = { type: ResourceViewType.termView, show: "TermView" };
    private sourceCodeStruct: ResViewStruct = { type: ResourceViewType.sourceCode, show: "Code" };
    private rViews: ResViewStruct[];
    private activeView: ResourceViewType = ResourceViewType.resourceView;

    ngOnInit() {
        let resViewPrefs: ResourceViewPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences;
        this.activeView = resViewPrefs.defaultConceptType;
        //eventually the last selected type "wins"
        if (resViewPrefs.lastConceptType != null) {
            this.activeView = resViewPrefs.lastConceptType;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            this.rViews = [this.resourceFormStruct];
            //add the simplified form if available
            if (VBContext.getSystemSettings().experimentalFeaturesEnabled && this.resource.getRole() == RDFResourceRolesEnum.concept) {
                this.rViews.push(this.simplifiedFormStruct)
            }
            //add the source code editor if available
            if (this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesGetResourceTriplesDescription, this.resource)) {
                this.rViews.push(this.sourceCodeStruct)
            }

            /*
            update the activeView by restoring the last active for the concept
            (even if the current resource is not a concept, it will be fixed later in case the view is not available)
            */
            let previousRes: ARTResource = changes['resource'].previousValue;
            /* the following if prevents to reset the view in case the input resource is still the same
            (input resource changes also when changing tab from this component) */
            if (previousRes != null && !previousRes.equals(this.resource)) {
                this.activeView = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.lastConceptType;
            }

            //if the current active view is not set, or it is no more available, activate the resourceForm as fallback
            if (this.activeView == null || (this.activeView == ResourceViewType.termView && !this.rViews.some(v => v.type == ResourceViewType.termView))) {
                this.activeView = ResourceViewType.resourceView;
            }
        }
    }

    changeView(view: ResourceViewType) {
        this.activeView = view;
        //just in case of concept update the setting about the last view activated (execpt for sourceCode)
        if (this.activeView != ResourceViewType.sourceCode && this.resource.getRole() == RDFResourceRolesEnum.concept) {
            VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.lastConceptType = this.activeView;
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

interface ResViewStruct {
    type: ResourceViewType;
    show: string;
}