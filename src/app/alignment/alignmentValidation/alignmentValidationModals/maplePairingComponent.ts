import { Component, Input } from '@angular/core';
import { Pairing } from '../../../models/Maple';

@Component({
    selector: 'maple-pairing',
    templateUrl: './maplePairingComponent.html',
})
export class MaplePairingComponent {

    @Input() pairing: Pairing;

    constructor() {}

}