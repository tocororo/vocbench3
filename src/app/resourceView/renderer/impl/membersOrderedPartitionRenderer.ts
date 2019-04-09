import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { SKOS } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SkosServices } from "../../../services/skosServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../../utils/ResourceUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiAddFunction } from "../partitionRenderer";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "members-ordered-renderer",
    templateUrl: "./membersOrderedPartitionRenderer.html",
})
export class MembersOrderedPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.membersOrdered;
    addManuallyAllowed: boolean = false;
    membersProperty = SKOS.member;
    addBtnImgTitle = "Add member";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/skosCollection_create.png");

    private selectedMember: ARTResource;

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    private selectMember(member: ARTResource) {
        if (this.selectedMember == member) {
            this.selectedMember = null;
        } else {
            this.selectedMember = member;
        }
    }

    /**
     * Needed to be implemented since this Component extends PartitionRenderSingleRoot, but not used.
     * Use addFirst addLast addBefore and addAfter instead
     */
    add() { }

    //not used since this partition doesn't allow manual add operation
    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(true);
    }

    /**
     * Adds a first member to an ordered collection 
     */
    private addFirst(predicate?: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, this.membersProperty, false, false).then(
            (data: any) => {
                let values: ARTResource[] = data.value;
                let addFunctions: MultiAddFunction[] = [{
                    function: this.skosService.addFirstToOrderedCollection(this.resource, values[0]),
                    value: values[0]
                }];
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    /**
     * Adds a last member to an ordered collection 
     */
    private addLast(predicate?: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, this.membersProperty, false, false).then(
            (data: any) => {
                let values: ARTResource[] = data.value;
                let addFunctions: MultiAddFunction[] = [{
                    function: this.skosService.addLastToOrderedCollection(this.resource, values[0]),
                    value: values[0]
                }];
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    private addBefore(predicate?: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, this.membersProperty, false, false).then(
            (data: any) => {
                let position = parseInt((<ARTLiteral>this.selectedMember.getAdditionalProperty(ResAttribute.INDEX)).getValue());
                let values: ARTResource[] = data.value;
                let addFunctions: MultiAddFunction[] = [{
                    function: this.skosService.addInPositionToOrderedCollection(this.resource, values[0], position),
                    value: values[0]
                }];
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    private addAfter(predicate?: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, this.membersProperty, false, false).then(
            (data: any) => {
                let position = parseInt((<ARTLiteral>this.selectedMember.getAdditionalProperty(ResAttribute.INDEX)).getValue()) + 1;
                let values: ARTResource[] = data.value;
                let addFunctions: MultiAddFunction[] = [{
                    function: this.skosService.addInPositionToOrderedCollection(this.resource, values[0], position),
                    value: values[0]
                }];
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    // This is called only when the user remove the whole member list, not single member
    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit(null)
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }


    private removeMember(member: ARTResource) {
        this.skosService.removeFromOrderedCollection(this.resource, <ARTResource>member).subscribe(
            stResp => this.update.emit(null)
        );
    }

    /**
     * Returns the title of the "-" button placed near an object in a subPanel body.
     */
    private getRemovePropImgTitle(predicate: ARTURIResource): string {
        return "Remove " + predicate.getShow();
    }

    private isDeleteDisabled() {
        return (
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isTripleInStaging(this.resource)) ||
            this.readonly || !AuthorizationEvaluator.ResourceView.isRemoveAuthorized(this.partition, this.resource)
        );
    }

}