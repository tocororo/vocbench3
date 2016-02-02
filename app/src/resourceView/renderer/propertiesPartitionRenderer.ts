import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects} from "../../utils/ARTResources";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "properties-renderer",
	templateUrl: "app/src/resourceView/renderer/predicateObjectListRenderer.html",
	directives: [RdfResourceComponent],
    providers: [ResourceUtils, PropertyServices],
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
    
    constructor(private propertyService:PropertyServices, private resUtils:ResourceUtils) {}
        
    public add() {
        alert("add property to resource " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public enrichProperty(predicate: ARTURIResource) {
        alert("add " + predicate.getShow() + " to resource " + this.resource.getShow());
        this.update.emit(null);
    }
    
    public removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        var type;
        var lang;
        if (object.isBNode()) {
            type = "bnode";
        } else if (object.isURIResource()) {
            type = "uri";
        } else if (object.isLiteral()) {
            if ((<ARTLiteral>object).isTypedLiteral()) {
                type = "typedLiteral";
            } else if ((<ARTLiteral>object).getLang() != null) {
                type = "plainLiteral";
                lang = (<ARTLiteral>object).getLang();
            } else {
                type = "literal";
            }
        }
        this.propertyService.removePropValue(this.resource.getURI(), predicate.getURI(), object.getNominalValue(), null, type, lang)
            .subscribe(
                stResp => this.update.emit(null),
                err => { alert("Error: " + err); console.error(err.stack); }
            );
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