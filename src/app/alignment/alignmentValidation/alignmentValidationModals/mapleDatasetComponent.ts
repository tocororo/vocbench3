import { Component, Input, SimpleChanges } from '@angular/core';
import { Dataset } from '../../../models/Maple';
import { ARTURIResource } from '../../../models/ARTResources';

@Component({
    selector: 'maple-dataset',
    templateUrl: './mapleDatasetComponent.html',
})
export class MapleDatasetComponent {

    @Input() dataset: Dataset

    private shortType: string;

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset']) {
            this.shortType = new ARTURIResource(this.dataset["@type"]).getLocalName();
        }
    }

}