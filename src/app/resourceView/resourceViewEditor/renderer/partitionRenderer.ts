import { Directive, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { Observable } from 'rxjs';
import { CustomForm, CustomFormValue } from "src/app/models/CustomForms";
import { PropertyServices } from "src/app/services/propertyServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTLiteral, ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { AddAction, ResViewPartition, ResViewUtils } from "../../../models/ResourceView";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { CRUDEnum, ResourceViewAuthEvaluator } from "../../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../../utils/ResourceUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AddPropertyValueModalReturnData } from "../resViewModals/addPropertyValueModal";
import { BrowseExternalResourceModalReturnData } from "../resViewModals/browseExternalResourceModal";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { MultiActionError, MultiActionFunction, MultiActionType, MultipleActionHelper } from "./multipleActionHelper";
import { EnrichmentType, PropertyEnrichmentHelper, PropertyEnrichmentInfo } from "./propertyEnrichmentHelper";

@Directive()
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
    protected propService: PropertyServices;
    protected cfService: CustomFormsServices;
    protected basicModals: BasicModalServices;
    protected creationModals: CreationModalServices;
    protected resViewModals: ResViewModalServices;

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices) {
        this.resourcesService = resourcesService;
        this.propService = propService;
        this.cfService = cfService;
        this.basicModals = basicModals;
        this.creationModals = creationModals;
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
    labelTranslationKey: string;
    /**
     * Src of the "add" icon placed on the groupPanel outline.
     * This is specific of a partition.
     */
    abstract addBtnImgSrc: string;
    /**
     * Title show on mouseover on the "add" icon placed on the groupPanel outline.
     * This is specific of a partition.
     */
    addTitleTranslationKey: string;

    /**
     * Action authorization
     */
    addDisabled: boolean = false;
    addExteranlResourceAllowed: boolean = false;
    addManuallyAllowed: boolean = false;

    /**
     * METHODS
     */

    ngOnInit() {
        this.labelTranslationKey = ResViewUtils.getResourceViewPartitionLabelTranslationKey(this.partition);
        this.addTitleTranslationKey = ResViewUtils.getResourceViewPartitionAddBtnTranslationKey(this.partition);
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
        this.addManuallyAllowed = !(this.partition in ResViewPartition) || ResViewUtils.addManuallyPartition.indexOf(this.partition) != -1; //custom partition OR add manually foreseen
        
    }

    /**
     * Listener of add event fired by "+" or "add value (manually)" buttons (manually parameter true)
     */
    addHandler(predicate?: ARTURIResource, action?: AddAction) {//manually becomes type: "default"|manuelly|remote
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

    protected addMultiple(addFunctions: MultiActionFunction[], errorHandler?: (errors: MultiActionError[]) => void, errors?: MultiActionError[]) {
        MultipleActionHelper.executeActions(addFunctions, MultiActionType.addition, this.basicModals, errorHandler, errors, () => this.update.emit());
    }
    protected handleSingleMultiAddError(error: MultiActionError) {
        MultipleActionHelper.handleSingleMultiActionError(error, MultiActionType.addition, this.basicModals);
    }
    protected handleMultipleMultiAddError(errors: MultiActionError[]) {
        MultipleActionHelper.handleMultipleMultiActionError(errors, MultiActionType.addition, this.basicModals);
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
                            this.basicModals.confirm({key:"STATUS.WARNING"}, {key:"MESSAGES.VALUE_TYPE_PROPERTY_RANGE_INCONSISTENT_CONFIRM", params:{property: property.getShow()}},
                                ModalType.warning).then(
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
        this.resViewModals.browseExternalResource({key:"ACTIONS.SELECT_EXTERNAL_RESOURCE"}, predicate, propChangeable).then(
            (data: BrowseExternalResourceModalReturnData) => {
                this.resourcesService.addValue(this.resource, data.property, data.resource).subscribe(
                    stResp => this.update.emit()
                );
            },
            () => {}
        );
    }

    protected enrichProperty(predicate: ARTURIResource) {
        PropertyEnrichmentHelper.getPropertyEnrichmentInfo(predicate, this.propService, this.basicModals).subscribe(
            (data: PropertyEnrichmentInfo) => {
                if (data.type == EnrichmentType.resource) {
                    this.enrichWithResource(predicate);
                } else if (data.type == EnrichmentType.literal) {
                    this.enrichWithTypedLiteral(predicate, data.allowedDatatypes, data.dataRanges);
                } else if (data.type == EnrichmentType.customForm) {
                    this.enrichWithCustomForm(predicate, data.form);
                }
            }
        )
    }

    protected enrichWithCustomForm(predicate: ARTURIResource, form: CustomForm) {
        this.resViewModals.enrichCustomForm({key: "ACTIONS.ADD_X", params:{x: predicate.getShow()}}, form.getId()).then(
            (entryMap: any) => {
                let cfValue: CustomFormValue = new CustomFormValue(form.getId(), entryMap);
                this.getAddPartitionAware(this.resource, predicate, cfValue).subscribe(() => this.update.emit());
            },
            () => { }
        )
    }

    /**
     * Opens a newTypedLiteral modal to enrich the predicate with a typed literal value 
     */
     protected enrichWithTypedLiteral(predicate: ARTURIResource, allowedDatatypes?: ARTURIResource[], dataRanges?: (ARTLiteral[])[]) {
        this.creationModals.newTypedLiteral({key: "ACTIONS.ADD_X", params:{x: predicate.getShow()}}, predicate, allowedDatatypes, dataRanges, true, true).then(
            (literals: ARTLiteral[]) => {
                let addFunctions: MultiActionFunction[] = [];
                literals.forEach((l: ARTLiteral) => {
                    addFunctions.push({
                        function: this.getAddPartitionAware(this.resource, predicate, l),
                        value: l
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        );
    }

    /**
     * Opens a modal to enrich the predicate with a resource 
     */
     protected enrichWithResource(predicate: ARTURIResource) {
        this.resViewModals.addPropertyValue({key: "ACTIONS.ADD_X", params:{x: predicate.getShow()}}, this.resource, predicate, false).then(
            (data: AddPropertyValueModalReturnData) => {
                let prop: ARTURIResource = data.property;
                let values: ARTURIResource[] = data.value;
                let addFunctions: MultiActionFunction[] = [];
                values.forEach((v: ARTURIResource) => {
                    addFunctions.push({
                        function: this.getAddPartitionAware(this.resource, prop, v),
                        value: v
                    });
                });
                this.addMultiple(addFunctions);
            },
            () => { }
        )
    }

    /**
     * This represents the specific partition implementation for the add. 
     * By default it is Resource.addValue(...), but it could be override in a partition if it has a specific implementation 
     * (like in notes partition for which exists the addNote service that accept a SpecialValue as value)
     * @param resource
     * @param predicate 
     * @param value 
     */
     protected getAddPartitionAware(resource: ARTResource, predicate: ARTURIResource, value: ARTNode | CustomFormValue): Observable<void> {
        return this.resourcesService.addValue(resource, predicate, value);
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
    protected removeHandler(predicate: ARTURIResource, object?: ARTNode) {
        if (object == null) {
            this.basicModals.confirm({key: "ACTIONS.DELETE_ALL_VALUES"}, {key:"MESSAGES.DELETE_ALL_VALUES_CONFIRM", params:{property: predicate.getShow()}}, ModalType.warning).then(
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
        let deleteFunctions: MultiActionFunction[] = [];
        this.predicateObjectList.forEach(poList => {
            if (poList.getPredicate().equals(predicate)) {
                let values: ARTNode[] = poList.getObjects();
                values.forEach((v: ARTNode) => {
                    deleteFunctions.push({
                        function: this.getRemoveFunction(predicate, v),
                        value: v
                    })
                });
                MultipleActionHelper.executeActions(deleteFunctions, MultiActionType.deletion, this.basicModals, null, null, () => this.update.emit());
            }
        });
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
    protected onObjectUpdate() {
        this.update.emit();
    }
    /**
     * Fired when an object in a subPanel is double clicked. It should simply emit a objectDblClick event.
     */
    protected objectDblClick(obj: ARTNode) {
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
    protected renderAsReified(predicate: ARTURIResource, object: ARTNode): boolean {
        return (predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE) && object.isResource());
    }

}