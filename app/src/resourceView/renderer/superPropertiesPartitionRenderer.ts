import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "superproperties-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [PropertyServices],
})
export class SuperPropertiesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();
    
    public label = "Superproperties";
    public addBtnImgSrc = "app/assets/images/prop_create.png";
    public addBtnImgTitle = "Add a superproperty";
    public removeBtnImgSrc = "app/assets/images/prop_delete.png";
    public removeBtnImgTitle = "Remove superproperty";
    
    constructor(private propService:PropertyServices, private eventHandler:VBEventHandler) {}
    
    public add() {
        alert("add superproperty to " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public remove(superProp: ARTURIResource) {
        this.propService.removeSuperProperty(this.resource.getURI(), superProp.getURI())
            .subscribe(
                stResp => {
                    this.eventHandler.superPropertyRemovedEvent.emit({resource: this.resource, parent: superProp});
                    this.update.emit(null);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
}