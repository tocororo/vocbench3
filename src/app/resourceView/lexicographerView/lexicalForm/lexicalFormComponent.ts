import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ARTLiteral, ARTURIResource } from "src/app/models/ARTResources";
import { Form, LexicalEntry } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { LexViewCache } from "../LexViewChache";

@Component({
    selector: "lexical-form",
    templateUrl: "./lexicalFormComponent.html",
    host: { class: "d-block" }
})
export class LexicalFormComponent {
    @Input() readonly: boolean = false;
    @Input() entry: LexicalEntry;
    @Input() form: Form;
    @Input() lemma: boolean; //tells if the form is a lemma (false if it is an "other form")
    @Input() lexViewCache: LexViewCache;
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update the lex view

    inlineEditStyle: string = "font-family: serif; font-size: 1.5rem;";

    pendingPhoneticRep: boolean;
    pendingMorphoProp: boolean;

    //auth
    editWrittenRepFormAuthorized: boolean;
    addMorphoPropAuthorized: boolean;
    addPhoneticRepAuthorized: boolean;
    removeFormAuthorized: boolean;

    constructor(private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices) {}

    ngOnInit() {
        if (this.lemma) {
            this.editWrittenRepFormAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexSetCanonicalForm) && !this.readonly;
        } else {
            this.editWrittenRepFormAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, this.form.id) && !this.readonly;
        }
        if (this.form.isInStagingRemove()) {
            this.readonly = true;
        }
        this.addMorphoPropAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, this.form.id) && !this.readonly;
        this.addPhoneticRepAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddFormRepresentation) && !this.readonly;
        this.removeFormAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveForm) && !this.readonly;
    }

    onWrittenRepEdited(newValue: string) {
        let oldWrittenRep = this.form[0].writtenRep[0]; //edit enabled only when the form is unique (not in validation)
        if (oldWrittenRep.getShow() == newValue) return;
        let newWrittenRep = new ARTLiteral(newValue, null, oldWrittenRep.getLang());
        let updateWrittenRepFn: Observable<void>;
        if (this.lemma) { //if lemma, simply replace the whole canonical form
            updateWrittenRepFn = this.ontolexService.setCanonicalForm(<ARTURIResource>this.entry.id, newWrittenRep);
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
        this.ontolexService.removeForm(<ARTURIResource>this.entry.id, OntoLex.otherForm, this.form.id).subscribe(
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