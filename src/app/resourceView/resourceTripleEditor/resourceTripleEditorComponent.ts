import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";
import { ResourcesServices } from "../../services/resourcesServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";

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
    private pristineDescription: string;
    private description: string;

    constructor(private resourcesService: ResourcesServices) {}

    ngOnInit() {
        //editor disabled if user has no permission to edit
        this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateResourceTriplesDescription, this.resource);
        this.initDescription();
    }

    private initDescription() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.resourcesService.getOutgoingTriples(this.resource, "N-Triples").subscribe(
            triples => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                this.description = triples;
                this.pristineDescription = triples;
            }
        );
    }

    private isApplyEnabled(): boolean {
        return this.description != this.pristineDescription && this.description != null && this.description.trim() != "";
    }

    private applyChanges() {
        if (this.description != this.pristineDescription) { //something changed
            this.resourcesService.updateResourceTriplesDescription(this.resource, this.description, "N-Triples").subscribe(
                () => {
                    this.update.emit(this.resource);
                    this.initDescription();
                }
            );
        }
    }

}