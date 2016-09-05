import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTNode, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {SKOS} from "../../utils/Vocabulary";
import {ResViewModalServices} from "../resViewModals/resViewModalServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "members-ordered-renderer",
	templateUrl: "app/src/resourceView/renderer/membersOrderedPartitionRenderer.html",
})
export class MembersOrderedPartitionRenderer {
    
    @Input('object-list') objectList:ARTResource[];
    @Input() resource: ARTResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

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
            selectedMember => {
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
            selectedMember => {
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
    private addBefore() {
        var position = this.objectList.indexOf(this.selectedMember) + 1; //indexOf is 0-based, position is 1-based
        this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
            selectedMember => {
                this.skosService.addInPositionToOrderedCollection(this.resource, selectedMember, position,
                    this.vbCtx.getContentLanguage(true)).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    private addAfter() {
        var position = this.objectList.indexOf(this.selectedMember) + 2; //indexOf is 0-based, position is 1-based
        this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
            selectedMember => {
                this.skosService.addInPositionToOrderedCollection(this.resource, selectedMember, position,
                    this.vbCtx.getContentLanguage(true)).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
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
    
}