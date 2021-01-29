import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ARTLiteral, ARTURIResource } from "src/app/models/ARTResources";
import { Form } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";

@Component({
    selector: "lexical-form",
    templateUrl: "./lexicalFormComponent.html",
    host: { class: "d-block" }
})
export class LexicalFormComponent {
    @Input() readonly: boolean = false;
    @Input() entry: ARTURIResource;
    @Input() form: Form;
    @Input() lemma: boolean; //tells if the form is a lemma (false if it is an "other form")
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

    onWrittenRepEdited(newValue: string) {
        let oldWrittenRep = this.form[0].writtenRep[0]; //edit enabled only when the form is unique (not in validation)
        if (oldWrittenRep.getShow() == newValue) return;
        let newWrittenRep = new ARTLiteral(newValue, null, oldWrittenRep.getLang());
        let updateWrittenRepFn: Observable<void>;
        if (this.lemma) { //if lemma, simply replace the whole canonical form
            updateWrittenRepFn = this.ontolexService.setCanonicalForm(this.entry, newWrittenRep);
        } else { //other form => update the writtenRep of the form
            updateWrittenRepFn = this.resourceService.updateTriple(this.form.id, OntoLex.writtenRep, oldWrittenRep, newWrittenRep);
        }
        updateWrittenRepFn.subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    deleteForm() {
        if (this.lemma) return;
        this.ontolexService.removeForm(this.entry, OntoLex.otherForm, this.form.id).subscribe(
            () => {
                this.update.emit();
            }
        )
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


    /**
     * Propagate the update request from the child component (morphosyntactic-prop and phonetic-rep)
     */
    onUpdate() {
        this.update.emit();
    }
}