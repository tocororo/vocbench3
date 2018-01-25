import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { SkosServices } from "../../../services/skosServices";
import {
    ARTResource, ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects,
    RDFResourceRolesEnum, RDFTypesEnum, ResAttribute, ResourceUtils
} from "../../../models/ARTResources";
import { SKOS } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";

@Component({
    selector: "members-ordered-renderer",
    templateUrl: "./membersOrderedPartitionRenderer.html",
})
export class MembersOrderedPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.membersOrdered;
    addManuallyAllowed: boolean = false;
    rootProperty = SKOS.memberList;
    membersProperty = SKOS.member;
    label = "Members";
    addBtnImgTitle = "Add member";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/collection_create.png");
    removeBtnImgTitle = "Remove member";

    private selectedMember: ARTResource;

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    private selectMember(member: ARTResource) {
        if (this.selectedMember == member) {
            this.selectedMember = null;
        } else {
            this.selectedMember = member;
        }
    }

    //needed to be implemented since this Component extends PartitionRenderSingleRoot, but not used.
    //Use addFirst addLast addBefore and addAfter instead
    add() { }

    //not used since this partition doesn't allow manual add operation
    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(true);
    }

    /**
     * Adds a first member to an ordered collection 
     */
    private addFirst(predicate?: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, this.membersProperty, false).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;
                this.skosService.addFirstToOrderedCollection(this.resource, member).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => { }
        );
    }

    /**
     * Adds a last member to an ordered collection 
     */
    private addLast(predicate?: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, this.membersProperty, false).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;
                this.skosService.addLastToOrderedCollection(this.resource, member).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => { }
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    private addBefore(predicate?: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, this.membersProperty, false).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;
                var position = parseInt((<ARTLiteral>this.selectedMember.getAdditionalProperty(ResAttribute.INDEX)).getValue());
                this.skosService.addInPositionToOrderedCollection(this.resource, member, position).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => { }
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    private addAfter(predicate?: ARTURIResource) {
        this.resViewModals.addPropertyValue("Add a member", this.resource, this.membersProperty, false).then(
            (data: any) => {
                var prop: ARTURIResource = data.property;
                var member: ARTResource = data.value;
                var position = parseInt((<ARTLiteral>this.selectedMember.getAdditionalProperty(ResAttribute.INDEX)).getValue()) + 1;
                this.skosService.addInPositionToOrderedCollection(this.resource, member, position).subscribe(
                    stResp => this.update.emit(null)
                );
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

    getRemoveFunction(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            return this.cfService.removeReifiedResource(this.resource, predicate, object);
        } else {
            return this.resourcesService.removeValue(this.resource, predicate, object);
        }
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
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isReourceInStaging(this.resource)) ||
            this.readonly || !AuthorizationEvaluator.ResourceView.isRemoveAuthorized(this.partition, this.resource)
        );
    }

}