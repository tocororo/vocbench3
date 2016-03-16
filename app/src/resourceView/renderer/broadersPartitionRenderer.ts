import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "broaders-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [SkosServices],
})
export class BroadersPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();
    
    private label = "Broaders";
    private addBtnImgSrc = "app/assets/images/concept_create.png";
    private addBtnImgTitle = "Add broader";
    private removeBtnImgSrc = "app/assets/images/concept_delete.png";
    private removeBtnImgTitle = "Remove broader";
    
    constructor(private skosService:SkosServices, private modalService: ModalServices) {}
    
    //add a broader
    private add() {
        alert("add broader to " + this.resource.getShow());
        this.update.emit(null);
    }
    
    private remove(broader: ARTURIResource) {
        this.skosService.removeBroaderConcept(this.resource, broader).subscribe(
            stResp => {
                this.update.emit(null);
            },
            err => {
                this.modalService.alert("Error", err, "error");
                console.error(err['stack']);
            }
        );
    }
    
}