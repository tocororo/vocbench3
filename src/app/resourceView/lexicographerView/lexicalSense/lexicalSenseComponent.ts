import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTResource } from "src/app/models/ARTResources";
import { Form, Sense } from "src/app/models/LexicographerView";
import { OntoLex, SKOS } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "lexical-sense",
    templateUrl: "./lexicalSenseComponent.html",
    styleUrls: ["./lexicalSenseComponent.css"],
    host: { class: "d-block" }
})
export class LexicalSenseComponent {
    @Input() readonly: boolean = false;
    @Input() lemma: Form;
    @Input() sense: Sense;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    pendingDef: boolean;

    constructor(private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices, private browsingModals: BrowsingModalServices) {}

    deleteSense() {
        this.ontolexService.removeSense(this.sense.id, true).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    //DEFINITION

    addDefinition() {
        this.pendingDef = true;
    }
    onPendingDefConfirmed(value: string) {
        let def: ARTLiteral = new ARTLiteral(value, null, this.lemma.writtenRep[0].getLang());
        this.resourceService.addValue(this.sense.id, SKOS.definition, def).subscribe(
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
        this.resourceService.updateTriple(this.sense.concept[0].id, SKOS.definition, def, newDefinition).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    deleteDefinition(def: ARTLiteral) {
        this.resourceService.removeValue(this.sense.id, SKOS.definition, def).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    //CONCEPT
    
    setConcept() {
        this.browsingModals.browseConceptTree({key: "DATA.ACTIONS.SELECT_LEXICAL_CONCEPT"}, null, true).then(
            lexConc => {
                this.resourceService.addValue(this.sense.id, OntoLex.isLexicalizedSenseOf, lexConc).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => {}
        )
    }

    /**
     * Propagate the update request from the child component (morphosyntactic-prop and phonetic-rep)
     */
    onUpdate() {
        this.update.emit();
    }

    resourceDblClick(resource: ARTResource) {
        this.dblclickObj.emit(resource);
    }

}