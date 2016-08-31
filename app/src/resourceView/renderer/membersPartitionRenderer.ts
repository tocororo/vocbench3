import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTNode, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {SKOS} from "../../utils/Vocabulary";
import {ResViewModalServices} from "../resViewModals/resViewModalServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "members-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
    providers: [ResViewModalServices],
})
export class MembersPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource: ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    private label = "Members";
    private addBtnImgTitle = "Add member";
    private removeBtnImgTitle = "Remove member";
    
    constructor(private rvModalService: ResViewModalServices, private skosService: SkosServices,
        private vbCtx: VocbenchCtx) {}
    
    /**
     * Adds a member in a collection (unordered)
     */
    private add() {
        this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
            selectedMember => {
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
    
}