import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ARTLiteral, ARTURIResource } from "src/app/models/ARTResources";
import { Form, LexicalEntry, LexicalResourceUtils } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
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

    constructor(private ontolexService: OntoLexLemonServices) {}

    ngOnInit() {
        if (LexicalResourceUtils.isInStagingRemove(this.form)) {
            this.readonly = true;
        }
        this.editWrittenRepFormAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexUpdateFormRepresentation) && !this.readonly;
        this.addMorphoPropAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, this.form.id) && !this.readonly;
        this.addPhoneticRepAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddFormRepresentation) && !this.readonly;
        this.removeFormAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveForm) && !this.readonly && !LexicalResourceUtils.isInStaging(this.form);
    }

    onWrittenRepEdited(newValue: string) {
        let oldWrittenRep = this.form.writtenRep[0]; //here I can get the first writtenRep since edit is enabled only when the form is unique (not in validation)
        if (oldWrittenRep.getShow() == newValue) return;
        let newWrittenRep = new ARTLiteral(newValue, null, oldWrittenRep.getLang());
        this.ontolexService.updateFormRepresentation(this.form.id, oldWrittenRep, newWrittenRep, OntoLex.writtenRep).subscribe(
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