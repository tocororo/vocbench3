import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral } from "src/app/models/ARTResources";
import { Form } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { ResourceUtils } from "src/app/utils/ResourceUtils";

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

    constructor(private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices) {}

    ngOnInit() {
        if (ResourceUtils.isTripleInStaging(this.phoneticRep)) {
            this.readonly = true;
        }
    }

    onEdited(newValue: string) {
        let newPhoneticRep: ARTLiteral = new ARTLiteral(newValue, null, this.phoneticRep.getLang());
        this.resourceService.updateTriple(this.form.id, OntoLex.phoneticRep, this.phoneticRep, newPhoneticRep).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    deleteRep() {
        this.resourceService.removeValue(this.form.id, OntoLex.phoneticRep, this.phoneticRep).subscribe(
            () => {
                this.update.emit();
            }
        )
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