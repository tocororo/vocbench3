import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute} from "../../utils/ARTResources";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {OwlServices} from "../../services/owlServices";

@Component({
	selector: "types-renderer",
    templateUrl: "./predicateObjectListRenderer.html",
})
export class TypesPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    private label = "Types";
    private addBtnImgTitle = "Add a type";
    private addBtnImgSrc = require("../../../assets/images/class_create.png");
    private removeBtnImgTitle = "Remove type"; 
    
    constructor(private owlService:OwlServices, private browsingService: BrowsingServices) {}
    
    //add type
    private add() {
        this.browsingService.browseClassTree("Select a class").then(
            (selectedClass: any) => {
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
    
    /**
     * Tells if the given object need to be rendered as reifiedResource or as simple rdfResource.
     * A resource should be rendered as reifiedResource if the predicate has custom range and the object
     * is an ARTBNode or an ARTURIResource (so a reifiable object). Otherwise, if the object is a literal
     * or the predicate has no custom range, the object should be rendered as simple rdfResource
     * @param object object of the predicate object list to render in view.
     */
    private renderAsReified(predicate: ARTURIResource, object: ARTNode) {
        return (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource());
    }

    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
}