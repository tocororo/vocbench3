import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTResource } from "src/app/models/ARTResources";
import { ConceptReference, Form, Sense } from "src/app/models/LexicographerView";
import { OntoLex, SKOS } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";

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

    constructor(private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices,
        private browsingModals: BrowsingModalServices, private creationModals: CreationModalServices) {}

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
        // alert("this view is still under development; the addition of definition is not yet working, so the added definition is only visualized temporarly and not stored permanently server side")
        // this.sense.definition.push();
        // this.pendingDef = false;
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
    deleteConcept(concept: ConceptReference) {
        this.resourceService.removeValue(this.sense.id, OntoLex.isLexicalizedSenseOf, concept.id).subscribe(
            () => {
                this.update.emit();
            }
        )
    }



    resourceDblClick(resource: ARTResource) {
        this.dblclickObj.emit(resource);
    }

}