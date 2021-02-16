import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTResource } from "src/app/models/ARTResources";
import { Sense, SenseRelation, SenseReference } from "src/app/models/LexicographerView";

@Component({
    selector: "translation",
    templateUrl: "./translationComponent.html",
    host: { class: "d-block" }
})
export class TranslationComponent {
    @Input() readonly: boolean = false;
    @Input() sense: Sense;
    @Input() relation: SenseRelation;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    sourceSense: SenseReference;
    targetSense: SenseReference;
    sourceTranslation: ARTLiteral;
    targetTranslation: ARTLiteral;

    constructor() {}

    ngOnInit() {
        let senseRef = this.relation.source.find(s => s.id.equals(this.sense.id));
        if (senseRef != null) { //the current sense is the source in the relation
            this.sourceSense = senseRef;
            this.targetSense = this.relation.target[0];
        } else { //the current sense is the target in the relation (inverted relation)
            this.sourceSense = this.relation.target[0];
            this.targetSense = this.relation.source[0];
        }
        this.sourceTranslation = this.sourceSense.entry[0].lemma[0].writtenRep[0];
        this.targetTranslation = this.targetSense.entry[0].lemma[0].writtenRep[0];
        /*
         * TODO handle validation: I have not idea on how to do it, it seems quite tricky:
         * in validation each sense reference could have multiple entry, 
         * each entry could have multiple lemma and each lemma could have multiple writtenRep
         */
    }

    targetSenseDblClick() {
        this.dblclickObj.emit(this.targetSense.id);
    }

}