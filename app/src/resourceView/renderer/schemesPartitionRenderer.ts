import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
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
    @Output() update = new EventEmitter();
    
    private label = "Schemes";
    private addBtnImgSrc = "app/assets/images/conceptScheme_create.png";
    private addBtnImgTitle = "Add to a ConceptScheme";
    private removeBtnImgSrc = "app/assets/images/conceptScheme_delete.png";
    private removeBtnImgTitle = "Remove from ConceptScheme";
    
    constructor(private skosService:SkosServices) {}
    
    //add as top concept
    private add() {
        alert("add resource " + this.resource.getShow() + " as to a scheme");
        this.update.emit(null);
    }
    
    private remove(scheme: ARTURIResource) {
        this.skosService.removeConceptFromScheme(this.resource, scheme).subscribe(
            stResp => {
                this.update.emit(null);
            },
            err => {
                alert("Error: " + err);
                console.error(err['stack']);
            }
        );
    }
    
}