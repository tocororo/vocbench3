import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTNode, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {SKOS} from "../../utils/Vocabulary";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ResViewModalServices} from "../resViewModals/resViewModalServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "members-ordered-renderer",
	templateUrl: "app/src/resourceView/renderer/membersOrderedPartitionRenderer.html",
	directives: [RdfResourceComponent],
    providers: [SkosServices, ResViewModalServices],
})
export class MembersOrderedPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource: ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    constructor(private rvModalService: ResViewModalServices,
        private skosService: SkosServices) {}
    
    /**
     * Adds a first member to an ordered collection 
     */
    private addFirst() {
        this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
            selectedMember => {
                this.skosService.addFirstToOrderedCollection(this.resource, selectedMember).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }

    /**
     * Adds a member in a given position to an ordered collection 
     */
    private addInPosition() {
        alert("still not available");
    }

    /**
     * Adds a last member to an ordered collection 
     */
    private addLast() {
        this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
            selectedMember => {
                this.skosService.addLastToOrderedCollection(this.resource, selectedMember).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
    private remove(member: ARTResource) {
        this.skosService.removeFromOrderedCollection(this.resource, member).subscribe(
            stResp => {
                this.update.emit(null);
            }
        )
    }
    
    private objectDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);//clicked object (type) can be a URIResource or BNode
    }
    
}