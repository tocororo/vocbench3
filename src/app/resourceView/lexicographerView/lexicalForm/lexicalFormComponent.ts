import { Component, EventEmitter, Input, Output } from "@angular/core";
import { tickStep } from "d3";
import { ARTLiteral, ARTURIResource } from "src/app/models/ARTResources";
import { Form } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
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

    pendingPhoneticRep: boolean;
    pendingMorphoProp: boolean;

    constructor(private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices) {}

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

    addPhoneticRep() {
        this.pendingPhoneticRep = true;
    }

    onPendingPhoneticRepCanceled() {
        this.pendingPhoneticRep = false;
    }

    /**
     * === MORPHOSYNTACTIC PROP ===
     */

    addMorphosintacticProp() {
        this.pendingMorphoProp = true;
    }

    onPendingMorphPropCanceled() {
        this.pendingMorphoProp = false;
    }




    onUpdate() {
        this.update.emit();
    }
}