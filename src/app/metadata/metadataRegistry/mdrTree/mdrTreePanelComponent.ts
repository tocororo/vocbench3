import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CatalogRecord2 } from 'src/app/models/Metadata';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { MetadataRegistryTreeComponent } from './mdrTreeComponent';
import { NewDatasetModal } from './newDatasetModal';

@Component({
    selector: "mdr-tree-panel",
    templateUrl: "./mdrTreePanelComponent.html",
    styleUrls: ['./mdrTree.css'],
    host: { class: "vbox" }
})
export class MetadataRegistryTreePanelComponent {

    @Output() nodeSelected = new EventEmitter<CatalogRecord2>();
    // @Output() nodeChecked = new EventEmitter<ConcreteDatasetMockup>();
    @ViewChild(MetadataRegistryTreeComponent) viewChildTree: MetadataRegistryTreeComponent;

    multiselection: boolean = false;

    selectedRecord: CatalogRecord2;
    checkedRecords: CatalogRecord2[] = [];


    constructor(private metadataRegistryService: MetadataRegistryServices, private modalService: NgbModal) { }

    // createAbstractDataset() {
    //     let datasetLocalName = "AGROVOC";
    //     let uriSpace = "http://aims.fao.org/aos/agrovoc/";
    //     let title = new ARTLiteral("AGROVOC multilingual thesaurus", null, "en");
    //     let description = new ARTLiteral("The AGROVOC thesaurus contains more than 38 000 concepts in 39 languages covering topics related to food, nutrition, agriculture, fisheries, forestry, environment and other related domains", null, "en");
    //     this.metadataRegistryService.createAbstractDataset(datasetLocalName, uriSpace, title, description).subscribe();
    // }

    createConcreteDataset() {
        const modalRef: NgbModalRef = this.modalService.open(NewDatasetModal, new ModalOptions('lg'));
        // modalRef.componentInstance.group = group;
        modalRef.result.then(
            () => { this.refresh(); }
        );
    }

    deleteRecord() {
        this.metadataRegistryService.deleteCatalogRecord(this.selectedRecord.identity).subscribe(
            () => {
                this.refresh();
            }
        );
    }

    refresh() {
        this.viewChildTree.init();
    }

    toggleMultiselection() {
        this.multiselection = !this.multiselection;
    }

    addNewDataset() { }

    addToExistingDataset() { }

    mergeDistributions() { }

    //EVENT LISTENERS
    onNodeSelected(node: CatalogRecord2) {
        this.selectedRecord = node;
        this.nodeSelected.emit(node);
    }

    onNodeChecked(datasets: CatalogRecord2[]) {
        this.checkedRecords = datasets;
    }
}