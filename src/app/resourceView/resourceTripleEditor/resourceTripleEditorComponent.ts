import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";
import { ResourcesServices } from "../../services/resourcesServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";

@Component({
    selector: "resource-triple-editor",
    templateUrl: "./resourceTripleEditorComponent.html",
    host: { class: "vbox" }
})
export class ResourceTripleEditorComponent {

    @Input() resource: ARTResource;
    @Input() readonly: boolean;
    @Output() update: EventEmitter<ARTResource> = new EventEmitter();

    @ViewChild('blockDiv') blockDivElement: ElementRef;

    private editAuthorized: boolean;
    private validationEnabled: boolean;
    private pristineDescription: string;
    private description: string;

    constructor(private resourcesService: ResourcesServices) {}

    ngOnInit() {
        //editor disabled if user has no permission to edit
        this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateResourceTriplesDescription);

        this.validationEnabled = VBContext.getWorkingProject().isValidationEnabled();
        if (this.validationEnabled) {
            this.editAuthorized = false;
        }

        this.initDescription();
    }

    private initDescription() {
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
    private onDescriptionChange() {
        if (this.pristineDescription == null) {
            this.pristineDescription = this.description;
        }
    }

    private isApplyEnabled(): boolean {
        return this.description != this.pristineDescription && this.description != null && this.description.trim() != "";
    }

    private applyChanges() {
        if (this.description != this.pristineDescription) { //something changed
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            this.resourcesService.updateResourceTriplesDescription(this.resource, this.description, "Turtle").subscribe(
                () => {
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                    this.update.emit(this.resource);
                    this.initDescription();
                }
            );
        }
    }

}