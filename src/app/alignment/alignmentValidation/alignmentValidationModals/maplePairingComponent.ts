import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RefinablePairing, Synonymizer, Pairing } from '../../../models/Maple';

@Component({
    selector: 'maple-pairing',
    templateUrl: './maplePairingComponent.html',
})
export class MaplePairingComponent {

    @Input() pairing: RefinablePairing;
    @Output() synonymizerChange: EventEmitter<Synonymizer> = new EventEmitter();

    selectedSynonymizer: Synonymizer;

    constructor() {}

    ngOnInit() {
        let scores = this.pairing.synonymizers.map(s => s.score);
        let maxScore = Math.max(...scores);
        this.selectedSynonymizer = this.pairing.synonymizers.find(s => s.score == maxScore);
    }

    onSynonimizerChanged() {
        this.synonymizerChange.emit(this.selectedSynonymizer);
    }

}