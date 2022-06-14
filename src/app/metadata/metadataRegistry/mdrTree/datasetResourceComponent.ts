import { Component, Input, SimpleChange } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { ARTLiteral } from 'src/app/models/ARTResources';
import { LanguageUtils } from 'src/app/models/LanguagesCountries';
import { DatasetMetadata2 } from 'src/app/models/Metadata';

@Component({
    selector: "dataset-resource",
    templateUrl: "./datasetResourceComponent.html",
    styles: [`
    :host {
        min-height: 16px;
        display: inline-flex;
        align-items: center;
    }
    .dataset-nature-icon {
        display: inline-block;
        width: 20px;
    }
    `]
})
export class DatasetResourceComponent {

    @Input() dataset: DatasetMetadata2;

    title: ARTLiteral;

    constructor(private translate: TranslateService) {}

    ngOnChanges(changes: SimpleChange) {
        this.title = LanguageUtils.getLocalizedLiteral(this.dataset.titles, this.translate.currentLang);
    }

}
