import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { ResourceAlignmentModal } from "../../alignment/resourceAlignment/resourceAlignmentModal";
import { GraphModalServices } from "../../graph/modal/graphModalServices";
import { ARTResource, ARTURIResource, ResAttribute } from "../../models/ARTResources";
import { SKOS } from "../../models/Vocabulary";
import { AlignmentServices } from "../../services/alignmentServices";
import { RefactorServices } from "../../services/refactorServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { ProjectContext } from "../../utils/VBContext";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";

@Component({
    selector: "res-view-menu",
    templateUrl: "./resourceViewCtxMenu.html",
})
export class ResourceViewContextMenu {

    @Input() resource: ARTResource;
    @Input() readonly: boolean;
    @Input() rendering: boolean;
    @Input() showInferred: boolean;
    @Input() projectCtx: ProjectContext;
    @Output() update = new EventEmitter();
    @Output() assertInferred = new EventEmitter();

    private isSetDeprecatedDisabled: boolean;
    private isAlignDisabled: boolean;
    private isSpawnFromLabelDisabled: boolean;
    private isAssertInferredDisabled: boolean;
    private isGraphAuthorized: boolean;

    constructor(private alignServices: AlignmentServices, private refactorService: RefactorServices, private resourcesService: ResourcesServices,
        private creationModals: CreationModalServices, private graphModals: GraphModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        //init the menu items
        this.isSetDeprecatedDisabled = (
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isResourceInStagingAdd(this.resource)) || 
            !AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesSetDeprecated, this.resource)
        );
        this.isAlignDisabled = (
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isResourceInStagingAdd(this.resource)) || 
		    !AuthorizationEvaluator.isAuthorized(VBActionsEnum.alignmentAddAlignment, this.resource)
        );
        this.isSpawnFromLabelDisabled = (
            !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) || 
		    !AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorSpawnNewConceptFromLabel, null, this.resource)
        );
        this.isAssertInferredDisabled = (
            !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) || 
            !AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, this.resource)
        );
        this.isGraphAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.graphRead);
    }

    private alignResource() {
        this.openAlignmentModal().then(
            (data: any) => {
                this.alignServices.addAlignment(this.resource, data.property, data.object).subscribe(
                    stResp => {
                        this.update.emit(this.resource);
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Opens a modal to create an alignment.
     * @return an object containing "property" and "object", namely the mapping property and the 
     * aligned object
     */
    private openAlignmentModal() {
        const modalRef: NgbModalRef = this.modalService.open(ResourceAlignmentModal, new ModalOptions());
        modalRef.componentInstance.resource = <ARTURIResource>this.resource; //cast since alignment is available only for URI
        return modalRef.result;
    }

    private spawnNewConceptWithLabel() {
        this.creationModals.newConceptFromLabel("Spawn new concept", this.resource, SKOS.concept).then(
            data => {
                //from the resView of the xLabel I don't know the concept to which it belongs, 
                //so oldConcept in spawnNewConceptFromLabel request is null and lets the server find the oldConcept
                this.refactorService.spawnNewConceptFromLabel(this.resource, data.schemes, null,
                    data.uriResource, data.broader, data.cfValue).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                );
            },
            () => { }
        );
    }

    private assertInferredStmts() {
        this.assertInferred.emit();
    }

    /**
     * Useful to enable menu item only for URIResource
     */
    isURIResource() {
        return this.resource.isURIResource();
    }

    private setAsDeprecated() {
        this.resourcesService.setDeprecated(this.resource).subscribe();
    }


    isOpenDataGraphEnabled(): boolean {
        return this.isGraphAuthorized;
    }

    private openDataGraph() {
        this.graphModals.openDataGraph(this.resource, this.rendering);
    }

}