import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "schemes-renderer",
    templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
    directives: [RdfResourceComponent],
    providers: [SkosServices],
})
export class SchemesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private label = "Schemes";
    private addBtnImgSrc = "app/assets/images/conceptScheme_create.png";
    private addBtnImgTitle = "Add to a ConceptScheme";
    private removeBtnImgSrc = "app/assets/images/conceptScheme_delete.png";
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
            },
            err => { }
        );
    }
    
}