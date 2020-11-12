import { Component, Input, SimpleChanges } from '@angular/core';
import { ARTURIResource } from '../../../models/ARTResources';
import { Dataset } from '../../../models/Maple';
import { Project } from '../../../models/Project';

@Component({
    selector: 'maple-dataset',
    templateUrl: './mapleDatasetComponent.html',
    styles: [`
        .rdfs { background-color: darkgray }
        .owl { background-color: #ff5959 }
        .skos { background-color: #00c5fc }
        .ontolex { background-color: #db9602 }
        td > label { min-width: 110px; }
    `]
})
export class MapleDatasetComponent {

    @Input() dataset: Dataset;

    shortType: string;
    private shortConformsTo: string;
    private modelBadgeClass: string;

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset']) {
            this.shortType = new ARTURIResource(this.dataset["@type"]).getLocalName();
            this.shortConformsTo = Project.getPrettyPrintModelType(this.dataset.conformsTo);
            //if the pretty print has found => apply the model badge class by "lower-casing" the pretty print
            this.modelBadgeClass = (this.shortConformsTo != this.dataset.conformsTo) ? this.shortConformsTo.toLowerCase() : "";
        }
    }

}