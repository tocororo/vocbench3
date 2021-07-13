import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { Configuration } from "../../../models/Configuration";
import { Bucket, DatasetDescription, DatasetSearchFacets, DatasetSearchResult, DownloadDescription, FacetAggregation, SearchResultsPage, SelectionMode } from "../../../models/Metadata";
import { ExtensionFactory, ExtensionPointID, PluginSpecification } from "../../../models/Plugins";
import { DatasetCatalogsServices } from "../../../services/datasetCatalogsServices";
import { ExtensionsServices } from "../../../services/extensionsServices";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { DataDumpSelectorModal } from "./dataDumpSelectorModal";

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
export class DatasetCatalogModal {

    @ViewChild('blockingDiv', { static: true }) private blockingDivElement: ElementRef;

    extensions: ExtensionFactory[];
    selectedExtension: ExtensionFactory;
    private extensionConfig: Configuration;

    query: string;
    private lastQuery: string;
    private lastSearchFacets: { [facetName: string]: { facetDisplayName?: string; items: { [itemName: string]: { itemDisplayName?: string } } } } = {};

    searchDatasetResult: SearchResultsPage<DatasetSearchResult>;
    private selectedDataset: DatasetSearchResult;
    selectedDatasetDescription: DatasetDescription;

    private page: number = 0;
    private totPage: number;

    constructor(public activeModal: NgbActiveModal, private metadataRepositoryService: DatasetCatalogsServices,
        private extensionService: ExtensionsServices, private modalService: NgbModal, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        //retrieves the list of extPoints (LOV and LODCloud)
        this.extensionService.getExtensions(ExtensionPointID.DATASET_CATALOG_CONNECTOR_ID).subscribe(
            extensions => {
                this.extensions = extensions;
            }
        );
    }

    onExtensionChange(selectedExtension: ExtensionFactory) {
        this.selectedExtension = selectedExtension;
        this.extensionConfig = null;
        this.clearResults();
    }

    onExtensionConfigUpdated(config: Configuration) {
        this.extensionConfig = config
        this.clearResults();
    }

    private clearResults() {
        this.searchDatasetResult = null;
        this.selectedDataset = null;
        this.selectedDatasetDescription = null;
    }

    onKeydown(event: KeyboardEvent) {
        if (event.key == "Enter") {
            if (this.query && this.query.trim() != "") {
                this.searchDataset();
            }
        }
    }

    searchDataset() {
        this.lastQuery = this.query;
        this.lastSearchFacets = {};
        this.executeSearchDataset();
    }

    private executeSearchDataset() {
        let connectorSpec = this.buildConnectorSpecification();
        if (!connectorSpec) return;

        let facets: DatasetSearchFacets = {};
        for (let facetName of Object.keys(this.lastSearchFacets)) {
            let items = Object.keys(this.lastSearchFacets[facetName].items);
            if (items.length != 0) {
                facets[facetName] = items;
            }
        }
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.metadataRepositoryService.searchDataset(connectorSpec, this.lastQuery, facets, this.page).subscribe(
            (results: SearchResultsPage<DatasetSearchResult>) => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.searchDatasetResult = results;
                this.selectedDatasetDescription = null;
                this.totPage = Math.floor(this.searchDatasetResult.totalResults / this.searchDatasetResult.pageSize);
                if (this.searchDatasetResult.totalResults % this.searchDatasetResult.pageSize != 0) {
                    this.totPage++;
                }
            }
        );
    }

    selectDataset(dataset: DatasetSearchResult) {
        let connectorSpec = this.buildConnectorSpecification();
        if (!connectorSpec) return;

        this.selectedDataset = dataset;
        this.metadataRepositoryService.describeDataset(connectorSpec, this.selectedDataset.id).subscribe(
            datasetDescription => {
                this.selectedDatasetDescription = datasetDescription;
            }
        )
    }

    requireConfigurationConnector() {
        if (this.extensionConfig != null) {
            return this.extensionConfig.requireConfiguration();
        }
        return false;
    }

    private buildConnectorSpecification() : PluginSpecification {
        let connectorSpec: PluginSpecification= { factoryId: this.selectedExtension.id };
        if (this.extensionConfig != null) {
            if (this.requireConfigurationConnector()) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.CATALOG_CONNECTOR_NOT_CONFIGURED"}, ModalType.warning);
                return;
            }
            if (this.extensionConfig != null) {
                connectorSpec.configType = this.extensionConfig.type;
                connectorSpec.configuration = this.extensionConfig.getPropertiesAsMap();
            }
        }
        return connectorSpec;

    }

    prevPage() {
        this.page--;
        this.executeSearchDataset();
    }
    nextPage() {
        this.page++;
        this.executeSearchDataset();
    }

    toggleFacet(facet: FacetAggregation, bucket: Bucket) {
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
            searchFacet.items[bucket.name] = { itemDisplayName: bucket.displayname };
        }

        this.executeSearchDataset();
    }

    private selectDataDump(): Promise<DownloadDescription> {
        const modalRef: NgbModalRef = this.modalService.open(DataDumpSelectorModal, new ModalOptions('lg'));
        modalRef.componentInstance.message = "The selected dataset catalog has multiple data dumps. Please select the one to use from this list.";
		modalRef.componentInstance.dataDumps = this.selectedDatasetDescription.dataDumps;
        return modalRef.result;
    }

    ok() {
        if (this.selectedDatasetDescription.dataDumps.length == 0) {
            let returnData: DatasetCatalogModalReturnData = {
                connectorId: this.selectedExtension.id,
                dataset: this.selectedDatasetDescription,
                dataDump: null
            }
            this.activeModal.close(returnData);
        } else if (this.selectedDatasetDescription.dataDumps.length == 1) {
            let returnData: DatasetCatalogModalReturnData = {
                connectorId: this.selectedExtension.id,
                dataset: this.selectedDatasetDescription,
                dataDump: this.selectedDatasetDescription.dataDumps[0]
            }
            this.activeModal.close(returnData);
        } else { //multiple data dumps
            this.selectDataDump().then(
                dump => {
                    let returnData: DatasetCatalogModalReturnData = {
                        connectorId: this.selectedExtension.id,
                        dataset: this.selectedDatasetDescription,
                        dataDump: dump
                    }
                    this.activeModal.close(returnData);
                },
                () => { }
            );
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export class DatasetCatalogModalReturnData {
    connectorId: string;
    dataset: DatasetDescription;
    dataDump: DownloadDescription;
}