import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode, ARTPredicateObjects} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {SkosServices} from "../../services/skosServices";
import {OwlServices} from "../../services/owlServices";

@Component({
	selector: "properties-renderer",
	templateUrl: "app/src/resourceView/renderer/predicateObjectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [SkosServices, OwlServices, ResourceUtils],
})
export class PropertiesPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();
    
    public label = "Properties";
    public addBtnImgSrc = "app/assets/images/prop_create.png";
    public addBtnImgTitle = "Add a property value";
    public removeBtnImgSrc = "app/assets/images/prop_delete.png";
    public removeBtnImgTitle = "Remove property value";
    
    constructor(private skosService:SkosServices, private owlService:OwlServices, 
        private eventHandler:VBEventHandler, private resUtils:ResourceUtils) {}
        
    public add() {
        alert("add property to resource " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public enrichProperty(predicate: ARTURIResource) {
        alert("add " + predicate.getShow() + " to resource " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        alert("remove triple " + this.resource.getShow() + " " + predicate.getShow() + " " + object.getShow());
        this.update.emit(null);
    }
    
    
    public getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    public getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
    public getAddPropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "create");
    }
    
    public getRemovePropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "delete");
    }
    
}