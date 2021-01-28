import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ARTLiteral, ARTURIResource } from "src/app/models/ARTResources";
import { Form, MorphosyntacticCache } from "src/app/models/LexicographerView";
import { ClassesServices } from "src/app/services/classesServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourcesServices } from "src/app/services/resourcesServices";

@Component({
    selector: "lexical-form",
    templateUrl: "./lexicalFormComponent.html"
})
export class LexicalFormComponent {
    @Input() readonly: boolean = false;
    @Input() form: Form;
    @Input() lemma: boolean;
    @Output() writtenRepEdited: EventEmitter<ARTLiteral> = new EventEmitter();
    @Output() delete: EventEmitter<void> = new EventEmitter(); //request to delete the form
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update the lex view

    inlineEditStyle: string;

    pendingMorphoProp: boolean;
    morphosyntacticProps: ARTURIResource[];
    selectedMorphoProp: ARTURIResource;
    morphosyntacticValues: ARTURIResource[];
    selectedMorphoValue: ARTURIResource;

    editingMorphoPropValue: { prop: ARTURIResource, value: ARTURIResource } = { prop: null, value: null };
    selectedEditingMorphoValue: ARTURIResource;

    constructor(private propertyService: PropertyServices, private classService: ClassesServices, private resourceService: ResourcesServices) {}

    ngOnInit() {
        this.inlineEditStyle = "font-family: serif;"
        if (this.lemma) {
            this.inlineEditStyle += " font-weight: bold; font-size: 2rem;";
        } else {
            this.inlineEditStyle += " font-style: italic;";
        }
    }

    onFormEdited(newValue: string) {
        let oldWrittenRep = this.form[0].writtenRep[0]; //edit enabled only when the form is unique (not in validation)
        if (oldWrittenRep.getShow() == newValue) return;
        let newWrittenRep = new ARTLiteral(newValue, null, oldWrittenRep.getLang());
        this.writtenRepEdited.emit(newWrittenRep)
    }

    deleteForm() {
        this.delete.emit();
    }

    //ADDITION

    addMorphosintacticProp() {
        this.pendingMorphoProp = true;
        this.getCachedMorphosyntacticProperty().subscribe(
            props => {
                this.morphosyntacticProps = props;
            }
        );
    }

    onMorphoPropChanged() {
        this.getCachedMorphosyntacticValue(this.selectedMorphoProp).subscribe(
            values => {
                this.morphosyntacticValues = values;
            }
        );
    }

    confirmPendingMorphPropValue() {
        this.resourceService.addValue(this.form.id, this.selectedMorphoProp, this.selectedMorphoValue).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    cancelPendingMorphPropValue() {
        this.pendingMorphoProp = false;
    }

    //EDIT

    isEditingPropValue(prop: ARTURIResource, value: ARTURIResource): boolean {
        return prop.equals(this.editingMorphoPropValue.prop) && value.equals(this.editingMorphoPropValue.value);
    }

    editMorphosyntacticValue(prop: ARTURIResource, value: ARTURIResource) {
        this.editingMorphoPropValue = { prop: prop, value: value };
        this.getCachedMorphosyntacticValue(prop).subscribe(
            values => {
                this.morphosyntacticValues = values;
                this.selectedEditingMorphoValue = values.find(v => v.equals(value));
            }
        );
    }

    confirmEditingMorphValue() {
        this.resourceService.updateTriple(this.form.id, this.editingMorphoPropValue.prop, this.editingMorphoPropValue.value, this.selectedEditingMorphoValue).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    cancelEditingMorphValue() {
        this.editingMorphoPropValue = { prop: null, value: null };
    }

    //CACHE UTILS

    getMorphosyntacticPropertyCache(): MorphosyntacticCache {
        return MorphosyntacticCache.getInstance(this.propertyService, this.classService);
    }
    getCachedMorphosyntacticProperty(): Observable<ARTURIResource[]> {
        return MorphosyntacticCache.getInstance(this.propertyService, this.classService).getProperties();
    }
    getCachedMorphosyntacticValue(property: ARTURIResource): Observable<ARTURIResource[]> {
        return MorphosyntacticCache.getInstance(this.propertyService, this.classService).getValues(property);
    }
    

}