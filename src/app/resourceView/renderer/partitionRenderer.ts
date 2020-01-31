import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResAttribute } from "../../models/ARTResources";
import { AddAction, ResViewPartition, ResViewUtils } from "../../models/ResourceView";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { CRUDEnum, ResourceViewAuthEvaluator } from "../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowseExternalResourceModalReturnData } from "../resViewModals/browseExternalResourceModal";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { MultiAddError, MultiAddFunction, MultipleAddHelper } from "./multipleAddHelper";

@Component({
    selector: "partition-renderer",
    templateUrl: "./partitionRenderer.html",
    styles: [
        '.hidden: { visibility: hidden; }'
    ]
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

    protected resourcesService: ResourcesServices;
    protected cfService: CustomFormsServices;
    protected basicModals: BasicModalServices;
    protected resViewModals: ResViewModalServices;

    constructor(resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, resViewModals: ResViewModalServices) {
        this.resourcesService = resourcesService;
        this.cfService = cfService;
        this.basicModals = basicModals;
        this.resViewModals = resViewModals;
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
    private label: string;
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
     * Action authorization
     */
    private addDisabled: boolean = false;
    private addExteranlResourceAllowed: boolean = false;
    private addManuallyAllowed: boolean = false;

    /**
     * METHODS
     */

    ngOnInit() {
        this.label = ResViewUtils.getResourceViewPartitionLabel(this.partition);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] || changes['readonly']) {
            this.initActionsStatus();
        }
    }

    initActionsStatus() {
        /**
         * Add is disabled if one of them is true
         * - resource is not explicit (e.g. imported or inferred) but not in staging add at the same time (addition in staging add is allowed)
         * - ResView is working in readonly mode
         * - user not authorized
         */
        this.addDisabled = !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isResourceInStagingAdd(this.resource) ||
            this.readonly || !ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.C, this.resource);
        this.addExteranlResourceAllowed = ResViewUtils.addExternalResourcePartition.indexOf(this.partition) != -1;
        this.addManuallyAllowed = ResViewUtils.addManuallyPartition.indexOf(this.partition) != -1;
    }

    /**
     * Listener of add event fired by "+" or "add value (manually)" buttons (manually parameter true)
     */
    private addHandler(predicate?: ARTURIResource, action?: AddAction) {//manually becomes type: "default"|manuelly|remote
        if (!predicate) {
            this.getPredicateToEnrich().subscribe(
                predicate => {
                    if (predicate) { //if not canceled
                        if (action == AddAction.manually) {
                            this.addManually(predicate, true);
                        } else if (action == AddAction.remote) {
                            this.addExternal(predicate, true);
                        } else {
                            this.add(predicate, true);
                        }
                    }
                }
            )
        } else {
            if (action == AddAction.manually) {
                this.addManually(predicate, false);
            } else if (action == AddAction.remote) {
                this.addExternal(predicate, false);
            } else {
                this.add(predicate, false);
            }
        }
    }
    
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
    abstract add(predicate: ARTURIResource, propChangeable: boolean): void;

    protected addMultiple(addFunctions: MultiAddFunction[], errorHandler?: (errors: MultiAddError[]) => void, errors?: MultiAddError[]) {
        MultipleAddHelper.addMultiple(addFunctions, this.basicModals, errorHandler, errors, () => this.update.emit());
    }
    protected handleSingleMultiAddError(error: MultiAddError) {
        MultipleAddHelper.handleSingleMultiAddError(error, this.basicModals);
    }
    protected handleMultipleMultiAddError(errors: MultiAddError[]) {
        MultipleAddHelper.handleMultipleMultiAddError(errors, this.basicModals);
    }

    /**
     * Implementation of addManually with the predicate provided
     * @param predicate 
     */
    private addManually(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.addManualValue(predicate, propChangeable).then(
            data => {
                let property: ARTURIResource = data.property;
                let value: ARTNode = data.value;
                this.checkTypeCompliantForManualAdd(property, value).subscribe(
                    compliant => {
                        if (compliant) { //value type compliant with predicate range
                            this.resourcesService.addValue(this.resource, property, value).subscribe(
                                stResp => this.update.emit()
                            );
                        } else { //value type not compliant with predicate range
                            let warningMsg = "The type of value is not compliant with the range of the property " + property.getShow()
                                + ". The operation may cause inconsistencies and malfunction. Do you want to force the add operation? ";
                            this.basicModals.confirm("Warning", warningMsg, "warning").then(
                                confirm => {
                                    this.resourcesService.addValue(this.resource, property, value).subscribe(
                                        stResp => this.update.emit()
                                    );
                                },
                                reject => {}
                            );
                        }
                    }
                )
            },
            () => {}
        );
    }

    private addExternal(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.browseExternalResource("Select external resource", predicate, propChangeable).then(
            (data: BrowseExternalResourceModalReturnData) => {
                this.resourcesService.addValue(this.resource, data.property, data.resource).subscribe(
                    stResp => this.update.emit()
                );
            },
            () => {}
        );
    }

    /**
     * Returns the predicate to enrich in case of an add operation is fired from the generic partition
     */
    abstract getPredicateToEnrich(): Observable<ARTURIResource>;

    /**
     * Tells if a value nature is compliant with the range of a predicate. Useful to check if a manually 
     * provided value is ok.
     * @param predicate 
     * @param value 
     */
    abstract checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean>;

    /**
     * Listener of remove event. If object is passed with the event remove just that object, otherwise remove all the values
     * @param predicate 
     * @param object 
     */
    private removeHandler(predicate: ARTURIResource, object?: ARTNode) {
        if (object == null) {
            this.basicModals.confirm("Delete all values", "You are deleting all the " + predicate.getShow() + " values. Are you sure?", "warning").then(
                yes => this.removeAllValues(predicate),
                no => { }
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
            if (this.predicateObjectList[i].getPredicate().getURI() == predicate.getURI()) {
                let objList: ARTNode[] = this.predicateObjectList[i].getObjects();
                for (var j = 0; j < objList.length; j++) {
                    let object = objList[j];
                    /**
                     * Prevent removing a triple in staging. Theoretically, it should not be allowed to execute a "Remove all values"
                     * if in the pred-obj list there is a triple in the staging graph. Anyway, since the check could be (currently)
                     * too expensive, the operation is allowed but it simply prevents from removing the staging triples.
                     */
                    if (ResourceUtils.isTripleInStaging(object)) continue;
                    
                    removeFnArray.push(this.getRemoveFunction(predicate, object));
                }
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
    protected getRemoveFunction(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        if (
            predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource() && 
            !object.getAdditionalProperty(ResAttribute.NOT_REIFIED)
        ) {
            return this.cfService.removeReifiedResource(this.resource, predicate, object);
        } else {
            return this.getRemoveFunctionImpl(predicate, object);
        }
    }
    /**
     * Implementation of the getRemoveFunction() for the partition
     */
    abstract getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any>;
    /**
     * Calls all the remove functions collected in removeAllValues
     * @param removeFnArray 
     */
    protected removeAllRicursively(removeFnArray: any[]) {
        if (removeFnArray.length == 0) return;
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
     * Customizes the behaviour to the edit action (fired from the editable-resource).
     * Note: in order to trigger this method, in the EditableResourceComponent it is necessary to change the
     * editActionScenario to "partition" in order to deletage the handling to the related partition
     * @param predicate 
     * @param object 
     */
    editHandler(predicate: ARTURIResource, object: ARTNode): void {
        /**
         * normally don't do nothing, only the partitions that require an ad hoc edit of the value (like subPropertyChain) need to
         * override the method
         */
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

}