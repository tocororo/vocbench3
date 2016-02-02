import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
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
    
    public label = "Schemes";
    public addBtnImgSrc = "app/assets/images/conceptScheme_create.png";
    public addBtnImgTitle = "Add to a ConceptScheme";
    public removeBtnImgSrc = "app/assets/images/conceptScheme_delete.png";
    public removeBtnImgTitle = "Remove from ConceptScheme";
    
    constructor(private skosService:SkosServices, private eventHandler:VBEventHandler) {}
    
    //add as top concept
    public add() {
        alert("add resource " + this.resource.getShow() + " as to a scheme");
        this.update.emit(null);
    }
    
    public remove(scheme: ARTURIResource) {
        this.skosService.removeConceptFromScheme(this.resource.getURI(), scheme.getURI())
            .subscribe(
                stResp => {
                    this.eventHandler.conceptRemovedFromSchemeEvent.emit({concept: this.resource, scheme: scheme});
                    this.update.emit(null);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
}