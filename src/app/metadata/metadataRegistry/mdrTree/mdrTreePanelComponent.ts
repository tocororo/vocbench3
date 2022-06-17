import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ARTURIResource } from 'src/app/models/ARTResources';
import { CatalogRecord2, DatasetRole } from 'src/app/models/Metadata';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { UIUtils } from 'src/app/utils/UIUtils';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalOptions, TextOrTranslation, TranslationUtils } from 'src/app/widget/modal/Modals';
import { ConnectToAbsDatasetModal } from './connectToAbsDatasetModal';
import { MdrTreeContext, MetadataRegistryTreeComponent } from './mdrTreeComponent';
import { MetadataRegistryTreeNodeComponent } from './mdrTreeNodeComponent';
import { NewDatasetModal, NewDatasetModeEnum } from './newDatasetModal';

@Component({
    selector: "mdr-tree-panel",
    templateUrl: "./mdrTreePanelComponent.html",
    styleUrls: ['./mdrTree.css'],
    host: { class: "vbox" }
})
export class MetadataRegistryTreePanelComponent {
    @Input() context: MdrTreeContext;
    @Output() nodeSelected = new EventEmitter<CatalogRecord2>();
    @ViewChild(MetadataRegistryTreeComponent) viewChildTree: MetadataRegistryTreeComponent;
    @ViewChild('blockingDiv', { static: false }) private blockingDivElement: ElementRef;

    multiselection: boolean = false;

    selectedRecord: CatalogRecord2;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices, private modalService: NgbModal, private translate: TranslateService) { }

    createConcreteDataset() {
        this.openNewDatasetModal({ key: "METADATA.METADATA_REGISTRY.ACTIONS.CREATE_CONCRETE_DATASET" }, NewDatasetModeEnum.createConcrete).then(
            () => {
                this.refresh();
            },
            () => { }
        );
    }

    connectToAbstractDataset() {
        const modalRef: NgbModalRef = this.modalService.open(ConnectToAbsDatasetModal, new ModalOptions('lg'));
        modalRef.componentInstance.concreteDataset = this.selectedRecord;
        modalRef.result.then(
            () => {
                this.refresh();
            },
            () => { }
        );
    }

    spawnNewAbstractDataset() {
        this.openNewDatasetModal({ key: "METADATA.METADATA_REGISTRY.ACTIONS.SPAWN_ABSTRACT_DATASET" }, NewDatasetModeEnum.spawnAbstract).then(
            () => {
                this.refresh();
            },
            () => { }
        );
    }

    openNewDatasetModal(title: TextOrTranslation, mode: NewDatasetModeEnum) {
        const modalRef: NgbModalRef = this.modalService.open(NewDatasetModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translate);
        modalRef.componentInstance.mode = mode;
        return modalRef.result;
    }


    discoverDataset() {
        this.basicModals.prompt({ key: "METADATA.METADATA_REGISTRY.ACTIONS.DISCOVER_DATASET" }, 
            { value: "IRI", tooltip: { key: "METADATA.METADATA_REGISTRY.ACTIONS.DISCOVER_DATASET_IRI_INFO" } }
        ).then(
            iri => {
                if (ResourceUtils.testIRI(iri)) {
                    UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                    this.metadataRegistryService.discoverDataset(new ARTURIResource(iri)).subscribe(
                        () => {
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

    disconnectFromAbstractDataset() {
        //look for the abstract dataset which is the parent of the disconnecting concrete one
        let abstractRoot: CatalogRecord2 = this.getAbstractOfSelectedRecord();
        let roots = this.viewChildTree.viewChildrenNode;
        if (roots) {
            roots.forEach(r => {
                if (r.children.find(c => c.identity.equals(this.selectedRecord.identity))) {
                    abstractRoot = r.record;
                }
            });
        }
        this.metadataRegistryService.disconnectFromAbstractDataset(this.selectedRecord.dataset.identity, abstractRoot.dataset.identity).subscribe(
            () => {
                this.refresh();
            }
        );
    }

    isDisconnectDisabled(): boolean {
        if (this.selectedRecord == null) {
            return true;
        } else {
            if (this.selectedRecord.dataset.role == DatasetRole.ROOT) {
                return true;
            } else {
                let abstractRootNode: MetadataRegistryTreeNodeComponent;
                let roots = this.viewChildTree.viewChildrenNode;
                if (roots) {
                    roots.forEach(r => {
                        if (r.children.find(c => c.identity.equals(this.selectedRecord.identity))) {
                            abstractRootNode = r;
                        }
                    });
                    if (abstractRootNode) {
                        return abstractRootNode.children.length < 2;
                    }
                }
            }
        }
        return false;
    }

    private getAbstractOfSelectedRecord(): CatalogRecord2 {
        let abstractRoot: CatalogRecord2;
        let roots = this.viewChildTree.viewChildrenNode;
        if (roots) {
            roots.forEach(r => {
                if (r.children.find(c => c == this.selectedRecord)) {
                    abstractRoot = r.record;
                }
            });
        }
        return abstractRoot;
    }

    refresh() {
        this.viewChildTree.init();
    }

    toggleMultiselection() {
        this.multiselection = !this.multiselection;
    }

    //EVENT LISTENERS
    onNodeSelected(node: CatalogRecord2) {
        this.selectedRecord = node;
        this.nodeSelected.emit(node);
    }

}