import { Component, Input } from "@angular/core";
import { DatasetDescription } from "../../../models/Metadata";
import { ExtensionFactory } from "../../../models/Plugins";

@Component({
    selector: "dataset-description",
    templateUrl: "./datasetDescriptionComponent.html",
    host: { class: "vbox" }
})
export class DatasetDescriptionComponent {

    @Input() dataset: DatasetDescription;
    @Input() extension: ExtensionFactory; //useful to determine how to render the facets

    //known extFact
    private readonly lodCloudConnector_id: string = "it.uniroma2.art.semanticturkey.extension.impl.datasetcatalog.lodcloud.LODCloudConnector";
    private readonly lovConnector_id: string = "it.uniroma2.art.semanticturkey.extension.impl.datasetcatalog.lov.LOVConnector";

    constructor() {}

    ngOnInit() {}

    getFacetsKeys() {
        return Object.keys(this.dataset.facets);
    }

}