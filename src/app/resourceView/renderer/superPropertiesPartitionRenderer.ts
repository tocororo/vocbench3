import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTNode, ARTURIResource, ARTPredicateObjects, ResAttribute} from "../../utils/ARTResources";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {PropertyServices} from "../../services/propertyServices";

@Component({
	selector: "superproperties-renderer",
	templateUrl: "./predicateObjectListRenderer.html",
})
export class SuperPropertiesPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();
    
    private label = "Superproperties";
    private addBtnImgTitle = "Add a superproperty";
    private addBtnImgSrc = require("../../../assets/images/prop_create.png");
    private removeBtnImgTitle = "Remove superproperty";
    
    constructor(private propService:PropertyServices, private browsingService: BrowsingServices) {}
    
    private add() {
        this.browsingService.browsePropertyTree("Select a super property").then(
            (selectedProp: any) => {
                this.propService.addSuperProperty(this.resource, selectedProp).subscribe(
                    stResp => this.update.emit(null) 
                );
            },
            () => {}
        );
    }
    
    private remove(superProp: ARTURIResource) {
        this.propService.removeSuperProperty(this.resource, superProp).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }
    
    private objectDblClick(obj: ARTURIResource) {
        this.dblclickObj.emit(obj);//clicked object (superProp) can only be a URIResource
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