import {Component, Input, Output, EventEmitter} from "@angular/core";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "broaders-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [SkosServices, BrowsingServices],
})
export class BroadersPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();
    
    private label = "Broaders";
    private addBtnImgTitle = "Add broader";
    private removeBtnImgTitle = "Remove broader";
    
    constructor(private skosService:SkosServices, private vbCtx: VocbenchCtx, private browsingService: BrowsingServices) {}
    
    //add a broader
    private add() {
        this.browsingService.browseConceptTree("Select a broader concept", this.vbCtx.getScheme(), true).then(
            selectedConcept => {
                this.skosService.addBroaderConcept(this.resource, selectedConcept).subscribe(
                    stResp => this.update.emit(null) 
                );
            },
            () => {}
        );
    }
    
    private remove(broader: ARTURIResource) {
        this.skosService.removeBroaderConcept(this.resource, broader).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }
    
    private objectDblClick(obj: ARTURIResource) {
        this.dblclickObj.emit(obj);//clicked object (broader) can only be a URIResource
    }
    
}