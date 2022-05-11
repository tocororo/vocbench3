import { Component, ElementRef, EventEmitter, Output, ViewChild } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ARTURIResource } from 'src/app/models/ARTResources';
import { CatalogRecord2 } from 'src/app/models/Metadata';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { UIUtils } from 'src/app/utils/UIUtils';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
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
    @ViewChild('blockingDiv', { static: false }) private blockingDivElement: ElementRef;

    multiselection: boolean = false;

    selectedRecord: CatalogRecord2;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices, private modalService: NgbModal, private translate: TranslateService) { }

    // createAbstractDataset() {
    //     let datasetLocalName = "AGROVOC";
    //     let uriSpace = "http://aims.fao.org/aos/agrovoc/";
    //     let title = new ARTLiteral("AGROVOC multilingual thesaurus", null, "en");
    //     let description = new ARTLiteral("The AGROVOC thesaurus contains more than 38 000 concepts in 39 languages covering topics related to food, nutrition, agriculture, fisheries, forestry, environment and other related domains", null, "en");
    //     this.metadataRegistryService.createAbstractDataset(datasetLocalName, uriSpace, title, description).subscribe();
    // }

    createConcreteDataset() {
        this.modalService.open(NewDatasetModal, new ModalOptions('lg')).result.then(
            () => { 
                this.refresh();
            },
            () => {}
        );
    }

    connectToAbstractDataset() {
        // this.metadataRegistryService.listRootDatasets().subscribe(
        //     datasets => {
        //         let abstractDatasets = datasets.filter(d => d.dataset.nature == DatasetNature.ABSTRACT);
        //         let opts: SelectionOption[] = abstractDatasets.map(d => {
        //             return {
        //                 value: LanguageUtils.getLocalizedLiteral(d.dataset.titles).getValue(),
        //                 description: d.dataset.identity.getURI()
        //             };
        //         });
        //         this.basicModals.select({ key: "Connect to abstract dataset" }, { key: "Select the abstract dataset to connect to" }, opts).then(
        //             (selection: SelectionOption) => {
        //                 let abstractDataset = abstractDatasets.find(d => d.dataset.identity.getURI() == selection.description);
        //                 this.metadataRegistryService.connectToAbstractDataset(this.selectedRecord.dataset.identity, abstractDataset.dataset.identity)
        //             },
        //             () => {}
        //         )
        //     }
        // )
        
    }

    spawnNewAbstractDataset() {

    }

    discoverDataset() {
        this.basicModals.prompt({ key: "METADATA.METADATA_REGISTRY.ACTIONS.DISCOVER_DATASET" }, {
            value: "Resource IRI", tooltip: "This IRI can be directly the IRI of the VoID description " +
                "of the Dataset (the instance of void:Dataset) or the IRI of any resource in the Dataset that points to this VoID description"
        }).then(
            iri => {
                if (ResourceUtils.testIRI(iri)) {
                    UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                    this.metadataRegistryService.discoverDataset(new ARTURIResource(iri)).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                            this.refresh();
                        }
                    );
                } else {
                    this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: iri } });
                }
            }
        );
    }

    deleteRecord() {
        this.metadataRegistryService.deleteCatalogRecord(this.selectedRecord.identity).subscribe(
            () => {
                this.selectedRecord = null;
                this.nodeSelected.emit(null);
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

}