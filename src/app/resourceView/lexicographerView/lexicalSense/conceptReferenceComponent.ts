import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTResource } from "src/app/models/ARTResources";
import { ConceptReference, Form, Sense } from "src/app/models/LexicographerView";
import { OntoLex, SKOS } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";

@Component({
    selector: "concept-ref",
    templateUrl: "./conceptReferenceComponent.html",
    host: { class: "d-block" }
})
export class ConceptReferenceComponent {
    @Input() readonly: boolean = false;
    @Input() concept: ConceptReference;
    @Input() sense: Sense;
    @Input() lemma: Form;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    pendingDef: boolean;

    constructor(private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices,
        private browsingModals: BrowsingModalServices, private creationModals: CreationModalServices) {}

    deleteConcept() {
        this.resourceService.removeValue(this.sense.id, OntoLex.isLexicalizedSenseOf, this.concept.id).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    addDefinition() {
        this.pendingDef = true;
    }
    onPendingDefConfirmed(value: string) {
        let def: ARTLiteral = new ARTLiteral(value, null, this.lemma.writtenRep[0].getLang());
        this.resourceService.addValue(this.concept.id, SKOS.definition, def).subscribe(
            () => {
                this.update.emit();        
            }
        )
    }
    onPendingDefCanceled() {
        this.pendingDef = false;
    }

    onDefinitionEdited(def: ARTLiteral, newValue: string) {
        let newDefinition = new ARTLiteral(newValue, null, def.getLang())
        this.resourceService.updateTriple(this.concept.id, SKOS.definition, def, newDefinition).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    deleteDefinition(def: ARTLiteral) {
        this.resourceService.removeValue(this.concept.id, SKOS.definition, def).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    resourceDblClick() {
        this.dblclickObj.emit(this.concept.id);
    }

}