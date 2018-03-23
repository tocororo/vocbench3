import { Component, Input } from "@angular/core";
import { DatasetMetadata } from "../../../../models/Metadata";

@Component({
    selector: "dataset-metadata",
    templateUrl: "./datasetMetadataComponent.html",
})
export class DatasetMetadataComponent {

    @Input() dataset: DatasetMetadata;

    constructor() { }

}