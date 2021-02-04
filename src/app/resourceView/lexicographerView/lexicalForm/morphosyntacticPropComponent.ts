import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ARTURIResource } from "src/app/models/ARTResources";
import { Form } from "src/app/models/LexicographerView";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { LexViewCache } from "../LexViewChache";

@Component({
    selector: "morphosyntactic-prop",
    templateUrl: "./morphosyntacticPropComponent.html"
})
export class MorphosyntacticPropComponent {
    @Input() readonly: boolean = false;
    @Input() form: Form;
    @Input() property: ARTURIResource;
    @Input() value: ARTURIResource;
    @Input() lexViewCache: LexViewCache;
    @Output() cancel: EventEmitter<void> = new EventEmitter(); //request to cancel the creation
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update

    properties: ARTURIResource[];
    selectedProp: ARTURIResource;
    values: ARTURIResource[];
    selectedValue: ARTURIResource;

    editing: boolean;

    ngClassValue: CssClass;

    constructor(private resourceService: ResourcesServices) {}

    ngOnInit() {
        if (this.property != null && this.value != null) {
            this.initRenderingClassStatus();
        } else {
            this.getCachedMorphosyntacticProperties().subscribe(
                props => {
                    this.properties = props;
                }
            )
        }
    }

    initRenderingClassStatus() {
        //reset all statuses
        this.ngClassValue = {
            proposedAddRes: false,
            proposedAddTriple: false,
            proposedRemoveRes: false,
            proposedRemoveTriple: false
        }
        //init statuses
        if (ResourceUtils.isResourceInStagingAdd(this.value)) {
            this.ngClassValue.proposedAddRes = true;
        } else if (ResourceUtils.isResourceInStagingRemove(this.value)) {
            this.ngClassValue.proposedRemoveRes = true;
        }
        if (ResourceUtils.isTripleInStagingAdd(this.value)) {
            this.ngClassValue.proposedAddTriple = true;
        } else if (ResourceUtils.isTripleInStagingRemove(this.value)) {
            this.ngClassValue.proposedRemoveTriple = true;
        }
        if (
            this.ngClassValue.proposedAddRes || this.ngClassValue.proposedAddTriple || 
            this.ngClassValue.proposedRemoveRes || this.ngClassValue.proposedRemoveTriple
        ) {
            this.readonly = true;
        }
    }

    //EDITING

    editValue() {
        if (this.readonly) return;
        this.getCachedMorphosyntacticValue(this.property).subscribe(
            values => {
                this.editing = true;
                this.values = values;
                this.selectedValue = this.values.find(v => v.equals(this.value));
            }
        );
    }

    confirmEdit() {
        if (!this.selectedValue.equals(this.value)) {
            this.resourceService.updateTriple(this.form.id, this.property, this.value, this.selectedValue).subscribe(
                () => {
                    this.update.emit();
                }
            )
        }
    }

    cancelEdit() {
        this.editing = false;
        this.selectedValue = this.values.find(v => v.equals(this.value));
    }

    //CREATION

    confirmCreation() {
        this.resourceService.addValue(this.form.id, this.selectedProp, this.selectedValue).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    cancelCreation() {
        this.cancel.emit();
    }

    onPropChanged() {
        this.values = []; //reset values
        this.getCachedMorphosyntacticValue(this.selectedProp).subscribe(
            values => {
                this.values = values;
            }
        );
    }

    //DELETION

    deleteValue() {
        this.resourceService.removeValue(this.form.id, this.property, this.value).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    //CACHE UTILS

    getCachedMorphosyntacticProperties(): Observable<ARTURIResource[]> {
        return this.lexViewCache.getMorphosyntacticProperties();
    }
    getCachedMorphosyntacticValue(property: ARTURIResource): Observable<ARTURIResource[]> {
        return this.lexViewCache.getMorphosyntacticValues(property);
    }

}

interface CssClass {
    proposedAddRes?: boolean;
    proposedRemoveRes?: boolean;
    proposedAddTriple?: boolean;
    proposedRemoveTriple?: boolean;
}