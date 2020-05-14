import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { ARTResource, ResAttribute } from "../../models/ARTResources";
import { VBActionsEnum } from "../../utils/VBActions";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBContext } from "../../utils/VBContext";

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

    ngOnInit() {
        this.isSimplifiedFormAvailable = VBContext.getSystemSettings().experimentalFeaturesEnabled;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource']) {
            this.isTriplesEditorAvailable = (
                this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) &&
                AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesGetResourceTriplesDescription, this.resource)
            );
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