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

    private lexicalSenses: ARTURIResource[];
    private selectedSense: ARTURIResource;

    constructor(private ontolexService: OntoLexLemonServices) {}

    private onLexEntrySelected(lexEntry: ARTURIResource) {
        this.selectedLexicalEntry = lexEntry;
        this.onLexicalSenseSelected(null);
        this.ontolexService.getLexicalEntrySenses(this.selectedLexicalEntry).subscribe(
            senses => {
                this.lexicalSenses = senses;
            }
        );

        // this.lexicalSenses = [
        //     new ARTURIResource("http://aaaa#sense1", "sense 1"),
        //     new ARTURIResource("http://aaaa#sense2", "sense 2"),
        //     new ARTURIResource("http://aaaa#sense3", "sense 3"),
        //     new ARTURIResource("http://aaaa#sense4", "sense 4"),
        // ];
    }

    private onLexEntryLexiconChange() {
        this.selectedLexicalEntry = null;
        this.onLexicalSenseSelected(null);
    }

    private onIndexChanged() {
        this.selectedLexicalEntry = null;
        this.onLexicalSenseSelected(null);
    }

    private onLexicalSenseSelected(sense: ARTURIResource) {
        this.selectedSense = sense;
        this.nodeSelected.emit(this.selectedSense);
    }

}