import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute} from "../../utils/ARTResources";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {SkosServices} from "../../services/skosServices";

@Component({
    selector: "schemes-renderer",
    templateUrl: "./predicateObjectListRenderer.html",
})
export class SchemesPartitionRenderer {
    
    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();
    
    private label = "Schemes";
    private addBtnImgTitle = "Add to a ConceptScheme";
    private addBtnImgSrc = require("../../../assets/images/conceptScheme_create.png");
    private removeBtnImgTitle = "Remove from ConceptScheme";
    
    constructor(private skosService:SkosServices, private browsingService: BrowsingServices) {}
    
    //add as top concept
    private add() {
        this.browsingService.browseSchemeList("Select a scheme").then(
            (selectedScheme: any) => {
                this.skosService.addConceptToScheme(this.resource, selectedScheme).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
    private remove(scheme: ARTURIResource) {
        this.skosService.removeConceptFromScheme(this.resource, scheme).subscribe(
            data => {
                this.update.emit(null);
            }
        );
    }
    
    private objectDblClick(obj: ARTURIResource) {
        this.dblclickObj.emit(obj);//clicked object (scheme) can only be a URIResource
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