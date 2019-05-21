import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DatasetSearchFacets, DatasetSearchResult, SearchResultsPage, DatasetDescription, FacetAggregation, SelectionMode, Bucket } from "../../../models/Metadata";
import { ExtensionFactory, ExtensionPointID } from "../../../models/Plugins";
import { ExtensionsServices } from "../../../services/extensionsServices";
import { DatasetCatalogsServices } from "../../../services/datasetCatalogsServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

export class DatasetCatalogModalData extends BSModalContext {
    constructor() {
        super();
    }
}

@Component({
    selector: "dataset-catalog-modal",
    templateUrl: "./datasetCatalogModal.html",
    styles: [`
        .searchDatasetResult { 
            flex-direction: column;
            align-items: initial;
            margin-bottom: 3px;
            padding: 3px 6px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }`
    ]
})
export class DatasetCatalogModal implements ModalComponent<DatasetCatalogModalData> {
    context: DatasetCatalogModalData;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private extensions: ExtensionFactory[];
    private selectedExtension: ExtensionFactory;

    private query: string;
    private lastQuery: string;
    private lastSearchFacets: { [facetName: string]: { facetDisplayName?: string; items: { [itemName:string]: { itemDisplayName?: string}}}} = {};

    private searchDatasetResult: SearchResultsPage<DatasetSearchResult>;
    private selectedDataset: DatasetSearchResult;
    private selectedDatasetDescription: DatasetDescription;

    private page: number = 0;
    private totPage: number;

    constructor(public dialog: DialogRef<DatasetCatalogModalData>, private metadataRepositoryService: DatasetCatalogsServices,
        private extensionService: ExtensionsServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //retrieves the list of extPoints (LOV and LODCloud)
        this.extensionService.getExtensions(ExtensionPointID.DATASET_CATALOG_CONNECTOR_ID).subscribe(
            extensions => {
                this.extensions = extensions;
            }
        );
    }

    private onExtensionChange() {
        this.searchDatasetResult = null;
        this.selectedDataset = null;
        this.selectedDatasetDescription = null;
    }

    private onKeydown(event: KeyboardEvent) {
        if (event.which == 13) {
            if (this.query && this.query.trim() != "") {
                this.searchDataset();
            }
        }
    }

    private searchDataset() {
        this.lastQuery = this.query;
        this.lastSearchFacets = {};
        this.executeSearchDataset();
    }

    private executeSearchDataset() {
        let facets: DatasetSearchFacets = {};
        for (let facetName of Object.keys(this.lastSearchFacets)) {
            let items = Object.keys(this.lastSearchFacets[facetName].items);
            if (items.length != 0) {
                facets[facetName] = items;
            }
        }
        this.metadataRepositoryService.searchDataset(this.selectedExtension.id, this.lastQuery, facets, this.page).subscribe(
            (results: SearchResultsPage<DatasetSearchResult>) => {
                this.searchDatasetResult = results;
                this.selectedDatasetDescription = null;
                this.totPage = Math.floor(this.searchDatasetResult.totalResults/this.searchDatasetResult.pageSize);
                if (this.searchDatasetResult.totalResults % this.searchDatasetResult.pageSize != 0) {
                    this.totPage++;
                }
            }
        );
    }

    private selectDataset(dataset: DatasetSearchResult) {
        this.selectedDataset = dataset;
        this.metadataRepositoryService.describeDataset(this.selectedExtension.id, this.selectedDataset.id).subscribe(
            datasetDescription => {
                this.selectedDatasetDescription = datasetDescription;
            }
        )
    }

    private prevPage() {
        this.page--;
        this.executeSearchDataset();
    }
    private nextPage() {
        this.page++;
        this.executeSearchDataset();
    }

    private toggleFacet(facet: FacetAggregation, bucket: Bucket) {
        let searchFacet = this.lastSearchFacets[facet.name]
        if (!searchFacet) {
            searchFacet = {
                facetDisplayName: facet.displayName,
                items: {}
            }
            this.lastSearchFacets[facet.name] = searchFacet;
        }

        let selectionMode = this.searchDatasetResult.facetAggregations.find(agg => agg.name == facet.name).selectionMode;

        if (selectionMode == SelectionMode.disabled) return;

        if (selectionMode == SelectionMode.single) {
            Object.keys(searchFacet.items).forEach(element => {
                if (element != bucket.name) {
                    delete searchFacet.items[element];
                }
            });
        }

        if (searchFacet.items[bucket.name]) {
            delete searchFacet.items[bucket.name];
        } else {
            searchFacet.items[bucket.name] = {itemDisplayName : bucket.displayname};
        }

        this.executeSearchDataset();
    }


    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        let returnData: DatasetCatalogModalReturnData = {
            connectorId: this.selectedExtension.id,
            dataset: this.selectedDatasetDescription
        }
        this.dialog.close(returnData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class DatasetCatalogModalReturnData {
    connectorId: string;
    dataset: DatasetDescription;
}