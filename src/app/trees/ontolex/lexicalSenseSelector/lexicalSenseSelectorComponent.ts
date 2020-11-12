import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTURIResource } from "../../../models/ARTResources";
import { SKOS } from '../../../models/Vocabulary';
import { VBProperties } from '../../../utils/VBProperties';
import { OntoLexLemonServices } from "../../../services/ontoLexLemonServices";

@Component({
    selector: "lexical-sense-selector",
    templateUrl: "./lexicalSenseSelectorComponent.html",
    host: { class: "vbox" }
})
export class LexicalSenseSelectorComponent {

    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    private selectedLexicalEntry: ARTURIResource;

    lexicalSenses: ARTURIResource[];
    private selectedSense: ARTURIResource;

    constructor(private ontolexService: OntoLexLemonServices) {}

    onLexEntrySelected(lexEntry: ARTURIResource) {
        this.selectedLexicalEntry = lexEntry;
        this.onLexicalSenseSelected(null);
        if (this.selectedLexicalEntry != null) {
            this.ontolexService.getLexicalEntrySenses(this.selectedLexicalEntry).subscribe(
                senses => {
                    this.lexicalSenses = senses;
                }
            );
        }
    }

    onLexEntryLexiconChange() {
        this.selectedLexicalEntry = null;
        this.onLexicalSenseSelected(null);
    }

    onIndexChanged() {
        this.selectedLexicalEntry = null;
        this.onLexicalSenseSelected(null);
    }

    onLexicalSenseSelected(sense: ARTURIResource) {
        this.selectedSense = sense;
        this.nodeSelected.emit(this.selectedSense);
    }

}