import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "top-concepts-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
})
export class TopConceptsPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();
    
    private label = "Top Concept of";
    private addBtnImgTitle = "Add to a ConceptScheme as topConcept";
    private removeBtnImgTitle = "Remove as topConcept";
    
    constructor(private skosService:SkosServices, private browsingService: BrowsingServices) {}
    
    //add as top concept
    private add() {
        this.browsingService.browseSchemeList("Select a scheme").then(
            selectedScheme => {
                this.skosService.addTopConcept(this.resource, selectedScheme).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
    private remove(scheme: ARTURIResource) {
        this.skosService.removeTopConcept(this.resource, scheme).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }
    
    private objectDblClick(obj: ARTNode) {
        this.dblclickObj.emit(<ARTURIResource>obj);//clicked object (scheme) can only be a URIResource
    }
    
}