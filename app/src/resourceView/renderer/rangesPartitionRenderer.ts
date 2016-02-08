import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "ranges-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [PropertyServices],
})
export class RangesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();
    
    public label = "Ranges";
    public addBtnImgSrc = "app/assets/images/class_create.png";
    public addBtnImgTitle = "Add a range";
    public removeBtnImgSrc = "app/assets/images/class_delete.png";
    public removeBtnImgTitle = "Remove range";
    
    constructor(private propService:PropertyServices) {}
    
    public add() {
        alert("add range to " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public remove(range: ARTURIResource) {
        this.propService.removePropertyRange(this.resource.getURI(), range.getURI())
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