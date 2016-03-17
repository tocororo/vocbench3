import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {OwlServices} from "../../services/owlServices";

@Component({
	selector: "types-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [OwlServices],
})
export class TypesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private label = "Types";
    private addBtnImgSrc = "app/assets/images/class_create.png";
    private addBtnImgTitle = "Add a type";
    private removeBtnImgSrc = "app/assets/images/class_delete.png";
    private removeBtnImgTitle = "Remove type"; 
    
    constructor(private owlService:OwlServices, private modalService: ModalServices,
        private browsingService: BrowsingServices) {}
    
    //add type
    private add() {
        this.browsingService.browseClassTree("Select a class").then(
            selectedClass => {
                this.owlService.addType(this.resource, selectedClass).subscribe(
                    stResp => this.update.emit(null)
                )
            }
        );
    }
    
    private remove(type: ARTURIResource) {
        this.owlService.removeType(this.resource, type).subscribe(
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