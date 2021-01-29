import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ARTLiteral, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { Form, Sense } from "src/app/models/LexicographerView";
import { OntoLex, SKOS } from "src/app/models/Vocabulary";
import { LexicographerViewServices } from "src/app/services/lexicographerViewServices";
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

    constructor(private lexicographerViewService: LexicographerViewServices, private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices,
        private browsingModals: BrowsingModalServices, private creationModals: CreationModalServices, private modalService: NgbModal) {}

    //DEFINITION

    addDefinition() {
        this.pendingDef = true;
    }
    onPendingDefConfirmed(newDef: string) {
        //TODO wait for clarification
        alert("this view is still under development; the addition of definition is not yet working, so the added definition is only visualized temporarly and not stored permanently server side")
        this.sense.definition.push(new ARTLiteral(newDef, this.lemma[0].writtenRep[0].getLang()));
        this.pendingDef = false;
    }
    onPendingDefCanceled() {
        this.pendingDef = false;
    }

    onDefinitionEdited(def: ARTLiteral, newValue: string) {
        let newDefinition = new ARTLiteral(newValue, null, def.getLang())
        this.resourceService.updateTriple(this.sense.concept[0], SKOS.definition, def, newDefinition).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    deleteDefinition(def: ARTLiteral) {
        //TODO wait for clarification
        //definition is attached to the lexical concept (which must be unique)
        this.resourceService.removeValue(this.sense.concept[0], SKOS.definition, def).subscribe(
            () => {
                this.update.emit();
            }
        )
    }

    //CONCEPT
    
    setConcept() {
        //TODO: this is a huge problem in a real case scenario where ontolex:LexicalConcept has too much instances
        this.browsingModals.browseInstanceList({key: "DATA.ACTIONS.SELECT_LEXICAL_CONCEPT"}, OntoLex.lexicalConcept).then(
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
    deleteConcept(concept: ARTURIResource) {
        this.resourceService.removeValue(this.sense.id, OntoLex.isLexicalizedSenseOf, concept).subscribe(
            () => {
                this.update.emit();
            }
        )
    }



    resourceDblClick(resource: ARTResource) {
        this.dblclickObj.emit(resource);
    }

}