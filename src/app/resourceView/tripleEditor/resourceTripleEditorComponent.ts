import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { VBEventHandler } from "src/app/utils/VBEventHandler";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTResource } from "../../models/ARTResources";
import { ResourcesServices } from "../../services/resourcesServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { Cookie } from "../../utils/Cookie";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "resource-triple-editor",
    templateUrl: "./resourceTripleEditorComponent.html",
    host: { class: "vbox" }
})
export class ResourceTripleEditorComponent {

    @Input() resource: ARTResource;
    @Input() readonly: boolean;
    @Input() pendingValidation: boolean;
    @Output() update: EventEmitter<ARTResource> = new EventEmitter();

    @ViewChild('blockDiv', { static: true }) blockDivElement: ElementRef;

    editAuthorized: boolean;
    description: string;

    private eventSubscriptions: Subscription[] = [];

    constructor(private resourcesService: ResourcesServices, private basicModals: BasicModalServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(this.eventHandler.resourceUpdatedEvent.subscribe(
            (resource: ARTResource) => this.onResourceUpdated(resource)
        ));
    }

    ngOnInit() {
        //editor disabled if user has no permission to edit
        this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateResourceTriplesDescription);

        this.initDescription();
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    initDescription() {
        //reinit the descriptions so that when initDescription is invoked after applyChanges, onDescriptionChange is triggered 
        this.description = null;
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.resourcesService.getOutgoingTriples(this.resource, "Turtle").subscribe(
            triples => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.description = triples;
            }
        );
    }

    isApplyEnabled(): boolean {
        /* encountered too much problems comparing description with a pristine copy (initialized at the initialization of the resource description)
        so, just check that the description is not empty. Allows to apply changes even if description is not changed */
        return this.description != null && this.description.trim() != "";
    }

    applyChanges() {
        if (VBContext.getWorkingProject().isValidationEnabled() && Cookie.getCookie(Cookie.WARNING_CODE_CHANGE_VALIDATION, null, VBContext.getLoggedUser()) != "false") {
            this.basicModals.alertCheckCookie({key: "RESOURCE_VIEW.CODE_EDITOR.CODE_EDITOR"}, 
                "Warning: the current project has the Validation feature enabled. This changes will not undergo to validation.", 
                Cookie.WARNING_CODE_CHANGE_VALIDATION).then(
                () => {
                    this.applyChangesImpl();
                }
            );
        } else {
            this.applyChangesImpl();
        }
    }

    private applyChangesImpl() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.resourcesService.updateResourceTriplesDescription(this.resource, this.description, "Turtle").subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.update.emit(this.resource);
                this.initDescription();
            },
            (err: Error) => {
                if (err.name.endsWith("IllegalArgumentException")) {
                    this.basicModals.alert({key:"STATUS.OPERATION_DENIED"}, {key:"MESSAGES.CANNOT_EDIT_DIFFERENT_RESOURCE_CODE"}, ModalType.warning);
                }
            }
        );
    }

    private onResourceUpdated(resource: ARTResource) {
        if (this.resource.equals(resource)) {
            this.initDescription();
        }
    }

}