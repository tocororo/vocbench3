import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource, ARTNode, ARTLiteral, ARTPredicateObjects} from "../../utils/ARTResources";
import {ResourceUtils} from "../../utils/ResourceUtils";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {ModalServices} from "../../widget/modal/modalServices";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
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
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    
    private label = "Properties";
    private addBtnImgSrc = "app/assets/images/prop_create.png";
    private addBtnImgTitle = "Add a property value";
    private removeBtnImgSrc = "app/assets/images/prop_delete.png";
    private removeBtnImgTitle = "Remove property value";
    
    constructor(private propertyService:PropertyServices, private resUtils:ResourceUtils, 
        private modalService: ModalServices, private browsingService: BrowsingServices) {}
        
    private add() {
        this.browsingService.browsePropertyTree("Select a property").then(
            selectedProp => {
                alert("enriching " + selectedProp.getShow() + " to resource " + this.resource.getShow());
            }
        );
        // this.update.emit(null);
    }
    
    private enrichProperty(predicate: ARTURIResource) {
        alert("add " + predicate.getShow() + " to resource " + this.resource.getShow());
        // this.update.emit(null);
    }
    
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
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
        this.propertyService.removePropValue(this.resource, predicate, object.getNominalValue(), null, type, lang).subscribe(
            stResp => this.update.emit(null),
            err => { this.modalService.alert("Error", err, "error"); console.error(err.stack); }
        );
    }
    
    
    private getAddPropImgTitle(predicate: ARTURIResource) {
        return "Add a " + predicate.getShow();
    }
    
    private getRemovePropImgTitle(predicate: ARTURIResource) {
        return "Remove " + predicate.getShow();
    }
    
    private getAddPropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "create");
    }
    
    private getRemovePropImgSrc(predicate: ARTURIResource) {
        return this.resUtils.getActionPropImageSrc(predicate, "delete");
    }
    
}