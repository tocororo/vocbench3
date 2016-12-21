import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, RDFResourceRolesEnum, ResAttribute} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {SKOS} from "../../utils/Vocabulary";
import {ResViewModalServices} from "../resViewModals/resViewModalServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "members-ordered-renderer",
	templateUrl: "./predicateObjectListRenderer.html",
})
export class MembersOrderedPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource: ARTResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    private label = "Members";
    private addBtnImgTitle = "Add member";
    private addBtnImgSrc = require("../../../assets/images/collection_create.png");
    private removeBtnImgTitle = "Remove member";

    private selectedMember: ARTResource;

    constructor(private rvModalService: ResViewModalServices, private skosService: SkosServices,
        private vbCtx: VocbenchCtx) {}

    selectMember(member: ARTResource) {
        if (this.selectedMember == member) {
            this.selectedMember = null;
        } else {
            this.selectedMember = member;
        }
    }
    
    /**
     * Adds a first member to an ordered collection 
     */
    private addFirst() {
        this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
            (selectedMember: any) => {
                this.skosService.addFirstToOrderedCollection(this.resource, selectedMember, this.vbCtx.getContentLanguage(true)).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }

    /**
     * Adds a last member to an ordered collection 
     */
    private addLast() {
        this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
            (selectedMember: any) => {
                this.skosService.addLastToOrderedCollection(this.resource, selectedMember, this.vbCtx.getContentLanguage(true)).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    // private addBefore() {
    //     var position = this.objectList.indexOf(this.selectedMember) + 1; //indexOf is 0-based, position is 1-based
    //     this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
    //         (selectedMember: any) => {
    //             this.skosService.addInPositionToOrderedCollection(this.resource, selectedMember, position,
    //                 this.vbCtx.getContentLanguage(true)).subscribe(
    //                 stResp => this.update.emit(null)
    //             );
    //         },
    //         () => {}
    //     );
    // }

    // /**
    //  * Adds a member in a given position to an ordered collection 
    //  */
    // private addAfter() {
    //     var position = this.objectList.indexOf(this.selectedMember) + 2; //indexOf is 0-based, position is 1-based
    //     this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
    //         (selectedMember: any) => {
    //             this.skosService.addInPositionToOrderedCollection(this.resource, selectedMember, position,
    //                 this.vbCtx.getContentLanguage(true)).subscribe(
    //                 stResp => this.update.emit(null)
    //             );
    //         },
    //         () => {}
    //     );
    // }
    
    private remove(member: ARTResource) {
        this.skosService.removeFromOrderedCollection(this.resource, member, this.vbCtx.getContentLanguage(true)).subscribe(
            stResp => {
                this.update.emit(null);
            }
        )
    }
    
    private objectDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);//clicked object (type) can be a URIResource or BNode
    }

    /**
     * Tells if the given object need to be rendered as reifiedResource or as simple rdfResource.
     * A resource should be rendered as reifiedResource if the predicate has custom range and the object
     * is an ARTBNode or an ARTURIResource (so a reifiable object). Otherwise, if the object is a literal
     * or the predicate has no custom range, the object should be rendered as simple rdfResource
     * @param object object of the predicate object list to render in view.
     */
    private renderAsReified(predicate: ARTURIResource, object: ARTNode) {
        return (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource());
    }

    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
}