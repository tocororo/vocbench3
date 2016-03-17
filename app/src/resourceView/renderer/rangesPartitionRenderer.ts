import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
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
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private label = "Ranges";
    private addBtnImgSrc = "app/assets/images/class_create.png";
    private addBtnImgTitle = "Add a range";
    private removeBtnImgSrc = "app/assets/images/class_delete.png";
    private removeBtnImgTitle = "Remove range";
    
    constructor(private propService:PropertyServices, private modalService: ModalServices,
        private browsingService: BrowsingServices) {}
    
    private add() {
        this.browsingService.browseClassTree("Select a range class").then(
            selectedClass => {
                this.propService.addPropertyRange(this.resource, selectedClass).subscribe(
                    stResp => this.update.emit(null)
                );
            }
        );
    }
    
    private remove(range: ARTURIResource) {
        this.propService.removePropertyRange(this.resource, range).subscribe(
            stResp => {
                this.update.emit(null);
            },
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err.stack);
            }
        );
    }
    
}