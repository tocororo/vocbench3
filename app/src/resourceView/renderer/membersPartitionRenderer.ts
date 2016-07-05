import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTNode, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {SKOS} from "../../utils/Vocabulary";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ResViewModalServices} from "./resViewModals/resViewModalServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "members-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [SkosServices, ResViewModalServices],
})
export class MembersPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    private label = "Members";
    private addBtnImgTitle = "Add member";
    private removeBtnImgTitle = "Remove member";
    
    constructor(private rvModalService: ResViewModalServices,
        private skosService: SkosServices) {}
    
    //add type
    private add() {
        if (this.resource.getRole() == RDFResourceRolesEnum.skosCollection) {
            this.rvModalService.enrichProperty("Add a skos:member", SKOS.member, [SKOS.collection, SKOS.concept]).then(
                selectedMember => {
                    this.skosService.addToCollection(this.resource, selectedMember).subscribe(
                        stResp => this.update.emit(null)
                    );
                }
            );
        } else if (this.resource.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
            //TODO find a way to specify add to begin to end or at index, maybe a dropdown menu with dedicated add button
        }
    }
    
    private remove(member: ARTResource) {
        if (this.resource.getRole() == RDFResourceRolesEnum.skosCollection) {
            this.skosService.removeFromCollection(this.resource, member).subscribe(
                stResp => {
                    this.update.emit(null);
                }
            )
        } else if (this.resource.getRole() == RDFResourceRolesEnum.skosOrderedCollection) {
            this.skosService.removeFromOrderedCollection(this.resource, member).subscribe(
                stResp => {
                    this.update.emit(null);
                }
            )
        }
    }
    
    private objectDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);//clicked object (type) can be a URIResource or BNode
    }
    
}