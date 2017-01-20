import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateValues, ResAttribute } from "../../utils/ARTResources";

@Component({
    selector: "pred-value-list-renderer",
    templateUrl: "./predicateValuesListRenderer.html",
})
export abstract class AbstractPredicateValuesListRenderer {

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

    //to handle partition collapsed/expanded
    partitionCollapsed: boolean = false;

    /**
     * Root properties described in the partition.
     * Note that this differs from wellKnownProperties from because this should only contains root properties
     * (those properties that has no super properties among the known properties) not all the known properties
     * (e.g. rdfs:label, skos(xl):pref/alt/hiddenLabel for lexicalizations partition)
     */
    abstract rootProperties: ARTURIResource[];
    /**
     * Properties described in the partition for which exists dedicated add/remove services
     * (e.g. rdfs:label, skos(xl):pref/alt/hiddenLabel for lexicalizations partition)
     */
    abstract knownProperties: ARTURIResource[];

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
     * Should allow to enrich a property by opening a modal and selecting a value.
     * It can get an optional parameter "property".
     * This is fired when the add button is clicked (the one placed on the groupPanel outline) without property parameter,
     * or hen the "+" button of a specific property panel is clicked (placed in the subPanel heading) with the property provided.
     * If property is provided (add fired from specific property panel) the modal won't allow to change it allowing so
     * to enrich just that property, otherwise, if property is not provided (add fired from the generic partition panel),
     * a modal will allow to choose the property to enrich.
     * @param predicate property to enrich.
     */
    abstract add(predicate?: ARTURIResource): void;
    /**
     * Removes an object related to the given predicate.
     * This is fired when the "-" button is clicked (near an object).
     */
    abstract removePredicateObject(predicate: ARTURIResource, object: ARTNode): void;
    //used in removePredicateObject to know if the removing object is about a well known property
    isKnownProperty(predicate: ARTURIResource): boolean {
        for (var i = 0; i < this.knownProperties.length; i++) {
            if (this.knownProperties[i].getURI() == predicate.getURI()) {
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
    private objectDblClick(obj: ARTNode) {
        if (obj.isResource()) {//emit double click only for resources (not for ARTLiteral that cannot be described in a ResView)
            this.dblclickObj.emit(<ARTResource>obj);
        }
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