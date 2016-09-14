import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "schemes-renderer",
    templateUrl: "./objectListRenderer.html",
})
export class SchemesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();
    
    private label = "Schemes";
    private addBtnImgTitle = "Add to a ConceptScheme";
    private removeBtnImgTitle = "Remove from ConceptScheme";
    
    constructor(private skosService:SkosServices, private browsingService: BrowsingServices) {}
    
    //add as top concept
    private add() {
        this.browsingService.browseSchemeList("Select a scheme").then(
            selectedScheme => {
                this.skosService.addConceptToScheme(this.resource, selectedScheme).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
    private remove(scheme: ARTURIResource) {
        this.skosService.removeConceptFromScheme(this.resource, scheme).subscribe(
            data => {
                this.update.emit(null);
            }
        );
    }
    
    private objectDblClick(obj: ARTURIResource) {
        this.dblclickObj.emit(obj);//clicked object (scheme) can only be a URIResource
    }
    
}