import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ResolvedSynonymizer } from './createRemoteAlignmentTaskModal';
import { Lexicon, ConceptualizationSet } from "../../../models/Maple";

export class SynonymizerDetailsModalData extends BSModalContext {
    constructor(public synonymizer: ResolvedSynonymizer) {
        super();
    }
}

@Component({
    selector: "synonymizer-details-modal",
    templateUrl: "./synonymizerDetailsModal.html",
})
export class SynonymizerDetailsModal implements ModalComponent<SynonymizerDetailsModalData> {
    context: SynonymizerDetailsModalData;

    private lexicon: Lexicon;
    private conceptualizationSet: ConceptualizationSet;

    constructor(public dialog: DialogRef<SynonymizerDetailsModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.lexicon = this.context.synonymizer.lexiconDataset;
        this.conceptualizationSet = this.context.synonymizer.conceptualizationSetDataset;
    }

    ok() {
        this.dialog.close();
    }
    
}