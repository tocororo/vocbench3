import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "top-concepts-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [SkosServices],
})
export class TopConceptsPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();
    
    private label = "Top Concepts";
    private addBtnImgSrc = "app/assets/images/conceptScheme_create.png";
    private addBtnImgTitle = "Add to a ConceptScheme as topConcept";
    private removeBtnImgSrc = "app/assets/images/conceptScheme_delete.png";
    private removeBtnImgTitle = "Remove as topConcept";
    
    constructor(private skosService:SkosServices, private eventHandler:VBEventHandler) {}
    
    //add as top concept
    private add() {
        alert("add resource " + this.resource.getShow() + " as top concept to a scheme");
        this.update.emit(null);
    }
    
    private remove(scheme: ARTURIResource) {
        this.skosService.removeTopConcept(this.resource.getURI(), scheme.getURI())
            .subscribe(
                stResp => {
                    this.eventHandler.conceptRemovedAsTopConceptEvent.emit({concept: this.resource, scheme: scheme});
                    this.update.emit(null);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
}