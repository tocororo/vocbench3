import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, RDFResourceRolesEnum, ResAttribute} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {SKOS} from "../../utils/Vocabulary";
import {ResViewModalServices} from "../resViewModals/resViewModalServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "members-renderer",
	templateUrl: "./predicateObjectListRenderer.html",
})
export class MembersPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource: ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    private label = "Members";
    private addBtnImgTitle = "Add member";
    private addBtnImgSrc = require("../../../assets/images/collection_create.png");
    private removeBtnImgTitle = "Remove member";
    
    constructor(private rvModalService: ResViewModalServices, private skosService: SkosServices,
        private vbCtx: VocbenchCtx) {}
    
    /**
     * Adds a member in a collection (unordered)
     */
    private add() {
        this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
            (selectedMember: any) => {
                this.skosService.addToCollection(this.resource, selectedMember, this.vbCtx.getContentLanguage(true)).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }

    private remove(member: ARTResource) {
        this.skosService.removeFromCollection(this.resource, member, this.vbCtx.getContentLanguage(true)).subscribe(
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