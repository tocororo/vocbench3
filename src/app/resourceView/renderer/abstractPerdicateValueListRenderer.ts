import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateValues, ResAttribute } from "../../utils/ARTResources";
// import { BrowsingServices } from "../../widget/modal/browsingModal/browsingServices";
// import { PropertyServices } from "../../services/propertyServices";
// import { ResourceServices } from "../../services/resourceServices";
import { CustomRangeServices } from "../../services/customRangeServices";
// import { RDF } from "../../utils/Vocabulary"

@Component({
    selector: "pred-value-list-renderer",
    templateUrl: "./predicateValueListRenderer.html",
})
export abstract class AbstractPredicateValueListRenderer {

    @Input('pred-value-list') predicateValueList: ARTPredicateValues[];
    @Input() resource: ARTResource; //resource described
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

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

    // protected propService: PropertyServices;
    // protected resourceService: ResourceServices;
    protected crService: CustomRangeServices;
    // protected browsingService: BrowsingServices;

    constructor(
        // propService: PropertyServices,
        // resourceService: ResourceServices,
        crService: CustomRangeServices) {
        // this.propService = propService;
        // this.resourceService = resourceService;
        this.crService = crService;
        // this.browsingService = browsingService;
    }

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
    private removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        if (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource()) {
            this.crService.removeReifiedResource(this.resource, predicate, object).subscribe(
                stResp => this.update.emit(null)
            );
        } else {
            //if it is removing a value about a root property, call the specific method
            if (this.isRootProperty(predicate)) {
                this.removeObjectForRootProperty(predicate, object);
            } else {//predicate is some subProperty of a root property
                //TODO I should retrieve the first parent of the predicate that is a rootProperty, then call the specific method
                
            }
        }
    }
    //used in removePredicateObject to know if the removing object is about a root property
    private isRootProperty(predicate: ARTURIResource): boolean {
        for (var i = 0; i < this.rootProperties.length; i++) {
            if (this.rootProperties[i].getURI() == predicate.getURI()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Remove the value (object) that enrich the root property of the partition.
     */
    abstract removeObjectForRootProperty(predicate: ARTURIResource, object: ARTNode): void;
    /**
     * Remove the value (object) that enrich a subProperty of a root property of the partition.
     */
    private removeObjectForSubRootProperty(predicate: ARTURIResource, superProp: ARTURIResource, object: ARTNode): void {
        //look for first parent rootProperty, then remove 
        /** problem: 
         * :subXlPrefLabel rdfs:subPropertyOf skosxl:prefLabel
         * C :subXlPrefLabel L
         * If I remove L as subXlPrefLabel of C, I should remove the triple C :subXlPrefLabel L
         * but I need also to do all the changes that removePrefLabel involves (L should be removed?)
         */
    };
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