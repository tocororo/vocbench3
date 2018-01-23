import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTResource, ARTNode, ARTURIResource, ARTPredicateObjects, ResAttribute, ResourceUtils } from "../../models/ARTResources";
import { ResViewPartition } from "../../models/ResourceView";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "partition-renderer",
    templateUrl: "./partitionRenderer.html",
})
export abstract class PartitionRenderer {

    /**
     * INPUTS / OUTPUTS
     */

    @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    @Input() resource: ARTResource; //resource described
    @Input() rendering: boolean;
    @Input() readonly: boolean;
    @Output() update = new EventEmitter(); //something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    protected basicModals: BasicModalServices;

    constructor(basicModals: BasicModalServices) {
        this.basicModals = basicModals;
    }

    /**
     * ATTRIBUTES
     */

    abstract partition: ResViewPartition;

    /**
     * to handle partition collapsed/expanded
     */
    partitionCollapsed: boolean = false;

    /**
     * to enabled/disable the add button
     */
    addAuthorized: boolean = true;

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
     * the modal allow to change property to enrich.
     * @param predicate property to enrich.
     */
    abstract add(predicate?: ARTURIResource): void;

    /**
     * Listener of remove event. If object is passed with the event remove just that object, otherwise remove all the values
     * @param predicate 
     * @param object 
     */
    private removeHandler(predicate: ARTURIResource, object?: ARTNode) {
        if (object == null) {
            this.basicModals.confirm("Delete all values", "You are deleting all the " + predicate.getShow() + " values. Are you sure?", "warning").then(
                yes => this.removeAllValues(predicate),
                no => {}
            )
        } else {
            this.removePredicateObject(predicate, object);
        }
    }
    /**
     * Removes all the objects of the predicate-objects list
     * @param predicate 
     */
    removeAllValues(predicate: ARTURIResource) {
        let removeFnArray: any[] = [];
        for (var i = 0; i < this.predicateObjectList.length; i++) {
            let objList: ARTNode[] = this.predicateObjectList[i].getObjects();
            for (var j = 0; j < objList.length; j++) {
                let object = objList[j];
                removeFnArray.push(this.getRemoveFunction(predicate, object));
            }
        }
        this.removeAllRicursively(removeFnArray);
    }
    /**
     * Removes an object related to the given predicate.
     * This is fired when the "-" button is clicked (near an object).
     */
    abstract removePredicateObject(predicate: ARTURIResource, object: ARTNode): void;
    /**
     * Based on the predicate and the object, returns the remove function to invoke
     * @param predicate 
     * @param object 
     */
    abstract getRemoveFunction(predicate: ARTURIResource, object: ARTNode): Observable<any>
    /**
     * Calls all the remove functions collected in removeAllValues
     * @param removeFnArray 
     */
    removeAllRicursively(removeFnArray: any[]) {
        removeFnArray[0].subscribe(
            (stResp: any) => {
                removeFnArray.shift();
                if (removeFnArray.length > 0) {
                    this.removeAllRicursively(removeFnArray);
                } else {
                    this.update.emit();
                }
            }
        );
    }
    
    /**
     * When the object is edited or replaced requires update of res view
     */
    private onObjectUpdate() {
        this.update.emit();
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

    private isAddDisabled(): boolean {
        return (
            (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isReourceInStaging(this.resource)) ||
            this.readonly || !AuthorizationEvaluator.ResourceView.isAddAuthorized(this.partition, this.resource)
        );
    }

}