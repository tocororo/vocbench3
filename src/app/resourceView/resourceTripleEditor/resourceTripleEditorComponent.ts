import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
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
    private pristineDescription: string;
    description: string;

    constructor(private resourcesService: ResourcesServices, private basicModals: BasicModalServices) {}

    ngOnInit() {
        //editor disabled if user has no permission to edit
        this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateResourceTriplesDescription);

        this.initDescription();
    }

    initDescription() {
        //reinit the descriptions so that when initDescription is invoked after applyChanges, onDescriptionChange is triggered 
        this.pristineDescription = null;
        this.description = null;
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.resourcesService.getOutgoingTriples(this.resource, "Turtle").subscribe(
            triples => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.description = triples;
            }
        );
    }

    /**
     * For an unknown reason codemirror changes the char codes of the ngModel-bound description string
     * (discovered by comparing the charCodeAt of the whole description and pristineDescription).
     * So if I initialize pristineDescription in initDescription(), description is immediately changed by codemirror, 
     * then the check this.description != this.pristineDescription (in isApplyEnabled()) detects the strings changed even if they are identical.
     * 
     * This is a workaround needed in order to initialize pristineDescription at soon as codemirror fire the update of the bound ngModel.
     */
    onDescriptionChange() {
        if (this.pristineDescription == null) {
            this.pristineDescription = this.description;
        }
    }

    isApplyEnabled(): boolean {
        return this.description != this.pristineDescription && this.description != null && this.description.trim() != "";
    }

    applyChanges() {
        if (VBContext.getWorkingProject().isValidationEnabled() && Cookie.getCookie(Cookie.WARNING_CODE_CHANGE_VALIDATION, VBContext.getLoggedUser().getIri()) != "false") {
            this.basicModals.alertCheckCookie("Code editor", 
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
                    this.basicModals.alert("Code editor", "You cannot modify a different resource. The only admitted subject is the editing resource (" + this.resource.toNT() + ")", ModalType.warning);
                }
            }
        );
    }

}