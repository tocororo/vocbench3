import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTNode} from "../../utils/ARTResources";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {OwlServices} from "../../services/owlServices";

@Component({
	selector: "types-renderer",
	templateUrl: "app/src/resourceView/renderer/objectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [BrowsingServices],
})
export class TypesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    private label = "Types";
    private addBtnImgTitle = "Add a type";
    private removeBtnImgTitle = "Remove type"; 
    
    constructor(private owlService:OwlServices, private browsingService: BrowsingServices) {}
    
    //add type
    private add() {
        this.browsingService.browseClassTree("Select a class").then(
            selectedClass => {
                this.owlService.addType(this.resource, selectedClass).subscribe(
                    stResp => this.update.emit(null)
                )
            },
            () => {}
        );
    }
    
    private remove(type: ARTURIResource) {
        this.owlService.removeType(this.resource, type).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }
    
    private objectDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);//clicked object (type) can be a URIResource or BNode
    }
    
    
}