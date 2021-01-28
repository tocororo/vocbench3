import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ARTLiteral, ARTURIResource } from "src/app/models/ARTResources";
import { Form } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { MorphosyntacticCache } from "./MorphosyntacticPropChache";

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

    //phonetic rep
    pendingPhoneticRep: boolean;
    phoneticRep: string;

    //morphosyntactic props
    pendingMorphoProp: boolean;
    morphosyntacticProps: ARTURIResource[];
    selectedMorphoProp: ARTURIResource;
    morphosyntacticValues: ARTURIResource[];
    selectedMorphoValue: ARTURIResource;

    editingMorphoPropValue: { prop: ARTURIResource, value: ARTURIResource } = { prop: null, value: null };
    selectedEditingMorphoValue: ARTURIResource;

    constructor(private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices, private morphosyntacticCache: MorphosyntacticCache) {}

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

    /**
     * === PHONETIC REP ===
     */

    onPhoneticRepEdited(oldPhoneticRep: ARTLiteral, newValue: string) {
        let newPhoneticRep: ARTLiteral = new ARTLiteral(newValue, null, oldPhoneticRep.getLang());
        this.resourceService.updateTriple(this.form.id, OntoLex.phoneticRep, oldPhoneticRep, newPhoneticRep).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    addPhoneticRep() {
        this.pendingPhoneticRep = true;
    }
    onPendingPhoneticRepConfirmed(value: string) {
        let phoneticRep: ARTLiteral = new ARTLiteral(value, null, this.form.writtenRep[0].getLang());
        this.ontolexService.addFormRepresentation(this.form.id, phoneticRep, OntoLex.phoneticRep).subscribe(
            () => {
                this.pendingPhoneticRep = false;
                this.update.emit();
            }
        )
    }
    onPendingPhoneticRepCanceled() {
        this.pendingPhoneticRep = false;
        this.phoneticRep = null;
    }

    deletePhoneticRep(phoneticRep: ARTLiteral) {
        this.resourceService.removeValue(this.form.id, OntoLex.phoneticRep, phoneticRep).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    /**
     * === MORPHOSYNTACTIC PROP ===
     */
    
     //- ADDITION

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

    //- EDIT

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

    //- DELETE

    deleteMorphosintacticProp(prop: ARTURIResource, value: ARTURIResource) {
        this.resourceService.removeValue(this.form.id, prop, value).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    //- CACHE UTILS

    // getMorphosyntacticPropertyCache(): MorphosyntacticCache {
    //     return MorphosyntacticCache.getInstance(this.lexic this.propertyService, this.classService);
    // }
    getCachedMorphosyntacticProperty(): Observable<ARTURIResource[]> {
        return this.morphosyntacticCache.getProperties();
    }
    getCachedMorphosyntacticValue(property: ARTURIResource): Observable<ARTURIResource[]> {
        return this.morphosyntacticCache.getValues(property);
    }
    

}