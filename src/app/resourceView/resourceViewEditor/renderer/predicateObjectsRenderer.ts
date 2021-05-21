import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { CustomFormValueTable } from "src/app/models/CustomForms";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResAttribute } from "../../../models/ARTResources";
import { Language } from "../../../models/LanguagesCountries";
import { AddAction, ResViewPartition, ResViewUtils } from "../../../models/ResourceView";
import { CRUDEnum, ResourceViewAuthEvaluator } from "../../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../../utils/ResourceUtils";

@Component({
    selector: "pred-obj-renderer",
    templateUrl: "./predicateObjectsRenderer.html",
    styles: [`
        :host {
            display: block;
            margin-bottom: 4px;
        }
        .imported {
            background-color: #ffffee
        }
        .inferred {
            background-color: #eff0ff
        }
    `]
    
})
export class PredicateObjectsRenderer {

    /**
     * INPUTS / OUTPUTS
     */

    @Input('pred-obj') predicateObjects: ARTPredicateObjects;
    @Input() resource: ARTResource; //resource described
    @Input() readonly: boolean;
    @Input() rendering: boolean;
    @Input() partition: ResViewPartition;
    @Output() add: EventEmitter<AddAction> = new EventEmitter<AddAction>();
    @Output() remove: EventEmitter<ARTNode> = new EventEmitter<ARTResource>(); //if the event doesn't contain the node, it means "delete all"
    @Output() edit: EventEmitter<ARTNode> = new EventEmitter<ARTResource>(); //require the parent partition renderer to edit the value
    @Output() update = new EventEmitter();
    @Output('copyLocale') copyLocaleOutput = new EventEmitter<{ value: ARTNode, locales: Language[] }>(); //forward the event copyLocale from editable-resource
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    /**
     * ATTRIBUTES
     */

    predicate: ARTURIResource;
    objects: ARTNode[];
    cfValueTables: CustomFormValueTable[];

    addDisabled: boolean = false;
    deleteAllDisabled: boolean = false;
    actionMenuDisabled: boolean = false;
    
    addManuallyAllowed: boolean = false;
    addExteranlResourceAllowed: boolean = false;


    constructor(private cfService: CustomFormsServices) {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] || changes['readonly']) {
            this.initActionsStatus();
        }
        if (changes['predicateObjects']) {
            this.predicate = this.predicateObjects.getPredicate();
            this.objects = this.predicateObjects.getObjects();

            if (this.predicate.getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE)) {
                let objs: ARTResource[] = <ARTResource[]>this.objects.filter(o => o instanceof ARTResource);
                if (objs.length > 0) {
                    this.cfService.getCustomFormValueTables(this.predicate, objs).subscribe(
                        tables => {
                            this.cfValueTables = tables;
                            // here I need to filter out from objects those values covered in any table
                            this.objects = this.objects.filter(o => //keep object if
                                !tables.some(t => //there is no table
                                    t.rows.some(r => r.describedObject.equals(o)) //containing the object
                                )
                            );
                        }
                    );
                }
            }
        }
    }

    private initActionsStatus() {
        /**
         * Add is disabled if one of them is true
         * - resource is not explicit (e.g. imported or inferred) but not in staging add at the same time (addition in staging add is allowed)
         * - ResView is working in readonly mode
         * - user not authorized
         */
        this.addDisabled = !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) && !ResourceUtils.isResourceInStagingAdd(this.resource) ||
            this.readonly || !ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.C, this.resource);

        /**
         * "Delete all values" is disabled if one of them is true
         * - subject resource is not explicit (e.g. imported, inferred, in staging)
         * - subject resource is in a staging status (staging-add or staging-remove)
         * - ResView is working in readonly mode
         * - user not authorized to delete operation on subject resource
         * - delete operation is not allowed on one of the objects (e.g. if user has no language capability on one of them)
         */
        this.deleteAllDisabled = !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
            ResourceUtils.isResourceInStaging(this.resource) ||
            this.readonly || !ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.D, this.resource);
        
        if (!this.deleteAllDisabled) { //if checks on subject resource are passed, performs checks on the objects
            for (let o of this.predicateObjects.getObjects()) {
                if (!ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.D, this.resource, o)) {
                    this.deleteAllDisabled = true;
                    break;
                }
            }
        }

        //menu disabled if all of its action are disabled
        this.actionMenuDisabled = this.addDisabled && this.deleteAllDisabled;

        this.addManuallyAllowed = ResViewUtils.addManuallyPartition.indexOf(this.partition) != -1;
        this.addExteranlResourceAllowed = ResViewUtils.addExternalResourcePartition.indexOf(this.partition) != -1;
    }

    /**
     * METHODS
     */

    /**
     * Should allow to enrich a property by opening a modal and selecting a value.
     * This is fired when the add button is clicked (the one placed on the groupPanel outline) without property parameter,
     * or hen the "+" button of a specific property panel is clicked (placed in the subPanel heading) with the property provided.
     * If property is provided (add fired from specific property panel) the modal won't allow to change it allowing so
     * to enrich just that property, otherwise, if property is not provided (add fired from the generic partition panel),
     * the modal allow to change property to enrich.
     * @param predicate property to enrich.
     */
    addValue() {
        this.add.emit(AddAction.default);
    }
    addManually() {
        this.add.emit(AddAction.manually);
    }
    addExternalValue() {
        this.add.emit(AddAction.remote);
    }

    /**
     * Removes an object related to the given predicate.
     * This is fired when the "-" button is clicked (near an object).
     */
    removeValue(object: ARTNode) {
        this.remove.emit(object);
    }
    removeAllValues() {
        this.remove.emit();
    }

    /**
     * Events forwarding
     */

    onEdit(object: ARTNode) {
        this.edit.emit(object);
    }
    onUpdate() {
        this.update.emit();
    }
    onDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);
    }
    onCopyLocale(locales: Language[], obj: ARTNode) {
        this.copyLocaleOutput.emit({ value: obj, locales: locales });
    }

    /**
     * Paging handlers
     */
    private pagingLimit: number = 10;
    private limitActive: boolean = true;
    showObject(index: number) {
        return !this.limitActive || (index < this.pagingLimit);
    }
    showAllButton() {
        return this.limitActive && (this.pagingLimit < this.predicateObjects.getObjects().length);
    }
    showAll() {
        this.limitActive = false;
    }


}