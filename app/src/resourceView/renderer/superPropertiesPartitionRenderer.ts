import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
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
    
    private label = "Superproperties";
    private addBtnImgSrc = "app/assets/images/prop_create.png";
    private addBtnImgTitle = "Add a superproperty";
    private removeBtnImgSrc = "app/assets/images/prop_delete.png";
    private removeBtnImgTitle = "Remove superproperty";
    
    constructor(private propService:PropertyServices) {}
    
    private add() {
        alert("add superproperty to " + this.resource.getShow());
        this.update.emit(null);
    }
    
    private remove(superProp: ARTURIResource) {
        this.propService.removeSuperProperty(this.resource.getURI(), superProp.getURI())
            .subscribe(
                stResp => {
                    this.update.emit(null);
                },
                err => {
                    alert("Error: " + err);
                    console.error(err.stack);
                }
            );
    }
    
}