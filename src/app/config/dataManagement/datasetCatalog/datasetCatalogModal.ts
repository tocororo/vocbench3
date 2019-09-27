import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { Bucket, DatasetDescription, DatasetSearchFacets, DatasetSearchResult, DownloadDescription, FacetAggregation, SearchResultsPage, SelectionMode } from "../../../models/Metadata";
import { ExtensionFactory, ExtensionPointID } from "../../../models/Plugins";
import { DatasetCatalogsServices } from "../../../services/datasetCatalogsServices";
import { ExtensionsServices } from "../../../services/extensionsServices";
import { DataDumpSelectorModalData, DataDumpSelectorModal } from "./dataDumpSelectorModal";
import { UIUtils } from "../../../utils/UIUtils";

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

    @ViewChild('blockingDiv') private blockingDivElement: ElementRef;

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
        private extensionService: ExtensionsServices, private modal: Modal) {
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
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.metadataRepositoryService.searchDataset(this.selectedExtension.id, this.lastQuery, facets, this.page).subscribe(
            (results: SearchResultsPage<DatasetSearchResult>) => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
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

    private selectDataDump(): Promise<DownloadDescription> {
        var modalData = new DataDumpSelectorModalData(
            "The selected dataset catalog has multiple data dumps. Please select the one to use from this list.",
            this.selectedDatasetDescription.dataDumps
        );
        const builder = new BSModalContextBuilder<DataDumpSelectorModalData>(
            modalData, undefined, DataDumpSelectorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size("lg").toJSON() };
        return this.modal.open(DataDumpSelectorModal, overlayConfig).result;
    }


    ok(event: Event) {
        if (this.selectedDatasetDescription.dataDumps.length == 0) {
            let returnData: DatasetCatalogModalReturnData = {
                connectorId: this.selectedExtension.id,
                dataset: this.selectedDatasetDescription,
                dataDump: null
            }
            this.dialog.close(returnData);
        } else if (this.selectedDatasetDescription.dataDumps.length == 1) {
            let returnData: DatasetCatalogModalReturnData = {
                connectorId: this.selectedExtension.id,
                dataset: this.selectedDatasetDescription,
                dataDump: this.selectedDatasetDescription.dataDumps[0]
            }
            this.dialog.close(returnData);
        } else { //multiple data dumps
            this.selectDataDump().then(
                dump => {
                    let returnData: DatasetCatalogModalReturnData = {
                        connectorId: this.selectedExtension.id,
                        dataset: this.selectedDatasetDescription,
                        dataDump: dump
                    }
                    this.dialog.close(returnData);
                },
                () => {}
            );
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class DatasetCatalogModalReturnData {
    connectorId: string;
    dataset: DatasetDescription;
    dataDump: DownloadDescription;
}