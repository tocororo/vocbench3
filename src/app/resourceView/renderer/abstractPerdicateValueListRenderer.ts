import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateValues, ResAttribute } from "../../utils/ARTResources";

@Component({
    selector: "pred-value-list-renderer",
    templateUrl: "./predicateValueListRenderer.html",
})
export abstract class AbstractPredicateValueListRenderer {

    /**
     * INPUTS / OUTPUTS
     */

    @Input('pred-value-list') predicateValueList: ARTPredicateValues[];
    @Input() resource: ARTResource; //resource described
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    /**
     * ATTRIBUTES
     */

    /**
     * Root properties described in the partition
     * (e.g. rdfs:label, skos(xl):pref/alt/hiddenLabel for lexicalizations partition)
     */
    abstract rootProperties: ARTURIResource[];
    /**
     * Label of the partition
     */
    abstract label: string;
    /**
     * Src of the "add" icon placed on the groupPanel outline.
     * This is specific of a partition.
     */
    abstract addBtnImgSrc: string;
    /**
     * Title show on mouseover on the "add" icon placed on the groupPanel outline.
     * This is specific of a partition.
     */
    abstract addBtnImgTitle: string;
    /**
     * Title shown on mouseover on the "-" button placed near an object in a subPanel body when just one property of the partition is enriched
     */
    abstract removeBtnImgTitle: string;

    /**
     * METHODS
     */

    /**
     * Should open a modal to select a property (specific of the partition) and enrich it.
     * This is fired when the add button is clicked (the one placed on the groupPanel outline,
     * or in the subPanel heading if just one property of the partition is enriched)
     */
    abstract add(): void;
    /**
     * Should open a modal to enrich the given property.
     * This is fired when the "+" button is clicked (placed in the subPanel heading)
     */
    abstract enrichProperty(predicate: ARTURIResource): void;
    /**
     * Removes an object related to the given predicate.
     * This is fired when the "-" button is clicked (near an object).
     */
    abstract removePredicateObject(predicate: ARTURIResource, object: ARTNode): void;
    //used in removePredicateObject to know if the removing object is about a root property
    isRootProperty(predicate: ARTURIResource): boolean {
        for (var i = 0; i < this.rootProperties.length; i++) {
            if (this.rootProperties[i].getURI() == predicate.getURI()) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Returns the title of the "+" button placed in a subPanel heading.
     * This is specific of a predicate of a partition, so it depends from a predicate.
     */
    private getAddPropImgTitle(predicate: ARTURIResource): string {
        return "Add a " + predicate.getShow();
    }
    /**
     * Returns the title of the "-" button placed near an object in a subPanel body.
     * This is specific of a predicate of a partition, so it depends from a predicate.
     */
    private getRemovePropImgTitle(predicate: ARTURIResource): string {
        return "Remove " + predicate.getShow();
    }
    /**
     * Fired when an object in a subPanel is double clicked. It should simply emit a objectDblClick event.
     */
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

}