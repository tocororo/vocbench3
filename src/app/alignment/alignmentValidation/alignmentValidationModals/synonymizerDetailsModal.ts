import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConceptualizationSet, Lexicon } from "../../../models/Maple";
import { ResolvedSynonymizer } from './createRemoteAlignmentTaskModal';

@Component({
    selector: "synonymizer-details-modal",
    templateUrl: "./synonymizerDetailsModal.html",
})
export class SynonymizerDetailsModal {
    @Input() synonymizer: ResolvedSynonymizer;

    lexicon: Lexicon;
    conceptualizationSet: ConceptualizationSet;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.lexicon = this.synonymizer.lexiconDataset;
        this.conceptualizationSet = this.synonymizer.conceptualizationSetDataset;
    }

    ok() {
        this.activeModal.close();
    }
    
}