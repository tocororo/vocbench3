import {Component, Input, Output, EventEmitter} from "@angular/core";
import {VocbenchCtx} from "../../utils/VocbenchCtx";
import {ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute} from "../../utils/ARTResources";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {SkosServices} from "../../services/skosServices";

@Component({
	selector: "broaders-renderer",
	templateUrl: "./predicateObjectListRenderer.html",
})
export class BroadersPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();
    
    private label = "Broaders";
    private addBtnImgTitle = "Add broader";
    private addBtnImgSrc = require("../../../assets/images/concept_create.png");
    private removeBtnImgTitle = "Remove broader";
    
    constructor(private skosService:SkosServices, private vbCtx: VocbenchCtx, private browsingService: BrowsingServices) {}
    
    //add a broader
    private add() {
        this.browsingService.browseConceptTree("Select a broader concept", this.vbCtx.getScheme(), true).then(
            (selectedConcept: any) => {
                this.skosService.addBroaderConcept(this.resource, selectedConcept).subscribe(
                    stResp => this.update.emit(null) 
                );
            },
            () => {}
        );
    }
    
    private remove(broader: ARTURIResource) {
        this.skosService.removeBroaderConcept(this.resource, broader).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }
    
    private objectDblClick(obj: ARTURIResource) {
        this.dblclickObj.emit(obj);//clicked object (broader) can only be a URIResource
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