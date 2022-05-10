import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral } from "src/app/models/ARTResources";
import { Form } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { VBActionsEnum } from "src/app/utils/VBActions";

@Component({
    selector: "phonetic-rep",
    templateUrl: "./phoneticRepComponent.html"
})
export class PhoneticRepComponent {
    @Input() readonly: boolean = false;
    @Input() form: Form;
    @Input() phoneticRep: ARTLiteral;
    @Output() cancel: EventEmitter<void> = new EventEmitter(); //request to cancel the creation
    @Output() update: EventEmitter<void> = new EventEmitter(); //something changed, request to update

    //auth
    editAuthorized: boolean;
    deleteAuthorized: boolean;

    constructor(private ontolexService: OntoLexLemonServices) {}

    ngOnInit() {
        if (this.phoneticRep && ResourceUtils.isTripleInStaging(this.phoneticRep)) { //check only in visualization (not in creation where phoneticRep is not provided)
            this.readonly = true;
        }
        this.editAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexUpdateFormRepresentation) && !this.readonly;
        this.deleteAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveFormRepresentation) && !this.readonly;
    }

    onEdited(newValue: string) {
        let newPhoneticRep: ARTLiteral = new ARTLiteral(newValue, null, this.phoneticRep.getLang());
        this.ontolexService.updateFormRepresentation(this.form.id, this.phoneticRep, newPhoneticRep, OntoLex.phoneticRep).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    deleteRep() {
        this.ontolexService.removeFormRepresentation(this.form.id, this.phoneticRep, OntoLex.phoneticRep).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    confirmCreation(value: string) {
        let phoneticRep: ARTLiteral = new ARTLiteral(value, null, this.form.writtenRep[0].getLang());
        this.ontolexService.addFormRepresentation(this.form.id, phoneticRep, OntoLex.phoneticRep).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    cancelCreation() {
        this.cancel.emit();
    }

}