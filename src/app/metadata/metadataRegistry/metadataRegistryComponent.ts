import { Component, ElementRef, ViewChild } from "@angular/core";
import { Data } from "@angular/router";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from "rxjs";
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { CatalogRecord, DatasetMetadata, LexicalizationSetMetadata } from "../../models/Metadata";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { NewCatalogRecordModal } from "./newCatalogRecordModal";
import { NewDatasetVersionModal } from "./newDatasetVersionModal";
import { NewEmbeddedLexicalizationModal } from "./newEmbeddedLexicalizationModal";

@Component({
    selector: "metadata-registry-component",
    templateUrl: "./metadataRegistryComponent.html",
    host: { class: "pageComponent" },
    styles: [`.activePanel { border: 2px solid #cde8ff; border-radius: 6px; }`]
})
export class MetadataRegistryComponent {

    @ViewChild('blockDiv', { static: false }) lexSetBlockDivElement: ElementRef;

    catalogs: CatalogRecord[];
    selectedCatalog: CatalogRecord;
    catalogDataset: DatasetMetadata;
    selectedDataset: { dataset: DatasetMetadata, isVersion?: boolean }; //can be the catalogDataset itself or one of its version

    lexicalizationSets: LexicalizationSetMetadata[] = []; //lex set of the selected dataset
    selectedLexicalizationSet: LexicalizationSetMetadata;
    
    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.initCatalogRecords();
    }

    /**
     * Catalog records
     */

    private initCatalogRecords(catalogToSelect?: string) {
        this.metadataRegistryService.getCatalogRecords().subscribe(
            catalogs => {
                this.catalogs = catalogs;
                this.selectedCatalog = null;
                this.selectedDataset = null;
                this.lexicalizationSets = [];
                //if catalogToSelect has been provided, select it
                if (catalogToSelect != null) {
                    this.catalogs.forEach(c => {
                        if (c.identity == catalogToSelect) {
                            this.selectCatalog(c);
                            return;
                        }
                    })
                }
            }
        );
    }

    private selectCatalog(catalog: CatalogRecord) {
        if (this.selectedCatalog != catalog) {
            this.selectedCatalog = catalog;
            this.selectedDataset = null;
            this.lexicalizationSets = [];
            this.initSelectedCatalogDataset();
        }
    }

    /**
     * Init the dataset of the selected catalog record
     */
    private initSelectedCatalogDataset() {
        this.metadataRegistryService.getDatasetMetadata(new ARTURIResource(this.selectedCatalog.abstractDataset.identity)).subscribe(
            dataset => {
                this.catalogDataset = dataset;
                //in initEmbeddedLexicalizationSets there's a reference to a loading div visible only when activeDatasetMetadata is not null
                //timeout gives time to init that div
                // setTimeout(() => {
                //     this.initEmbeddedLexicalizationSets();
                // });
                
            }
        )
    }

    onDatasetUpdate() {
        this.initSelectedCatalogDataset();
    }

    discoverDataset() {
        this.basicModals.prompt({key:"ACTIONS.DISCOVER_DATASET"}, { value: "Resource IRI", tooltip: "This IRI can be directly the IRI of the VoID description " + 
            "of the Dataset (the instance of void:Dataset) or the IRI of any resource in the Dataset that points to this VoID description" }).then(
            iri => {
                if (ResourceUtils.testIRI(iri)) {
                    UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                    this.metadataRegistryService.discoverDataset(new ARTURIResource(iri)).subscribe(
                        stResp => {
                            UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                            this.initCatalogRecords();        
                        }
                    );
                } else {
                    this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, {key:"MESSAGES.INVALID_IRI", params:{iri: iri}});
                }
            }
        )   
    }

    addCatalogRecord() {
        const modalRef: NgbModalRef = this.modalService.open(NewCatalogRecordModal, new ModalOptions());
        modalRef.componentInstance.title = "New Catalog Record";
        return modalRef.result.then(
            () => {
                this.initCatalogRecords();
            },
            () => {}
        );
    }

    deleteCatalogRecord() {
        this.metadataRegistryService.deleteCatalogRecord(new ARTURIResource(this.selectedCatalog.identity)).subscribe(
            stResp => {
                this.initCatalogRecords();
            }
        );
    }

    /**
     * Dataset and versions
     */

    /**
     * select the main dataset of the catalog record
     */
    selectCatalogDataset() {
        this.selectedDataset = { dataset: this.catalogDataset, isVersion: false };
        this.initEmbeddedLexicalizationSets();
    }
    /**
     * Select a version of the dataset
     */
    selectVersion(v: DatasetMetadata) {
        this.selectedDataset = { dataset: v, isVersion: true };
        this.initEmbeddedLexicalizationSets();
    }

    addDatasetVersion() {
        const modalRef: NgbModalRef = this.modalService.open(NewDatasetVersionModal, new ModalOptions());
        modalRef.componentInstance.catalogRecordIdentity = this.selectedCatalog.identity;
        return modalRef.result.then(
            () => {
                this.initCatalogRecords(this.selectedCatalog.identity);
            },
            () => {}
        );
    }

    deleteDatasetVersion() {
        if (this.selectedDataset.isVersion) {
            this.metadataRegistryService.deleteDatasetVersion(new ARTURIResource(this.selectedDataset.dataset.identity)).subscribe(
                stResp => {
                    this.initCatalogRecords();
                }
            );
        }
    }

    onVersionUpdate() {
        this.initCatalogRecords(this.selectedCatalog.identity);
    }

    /**
     * Lexicalization sets
     */

    private initEmbeddedLexicalizationSets() {
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        this.metadataRegistryService.getEmbeddedLexicalizationSets(new ARTURIResource(this.selectedDataset.dataset.identity)).subscribe(
            sets => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.lexicalizationSets = sets;
                this.selectedLexicalizationSet = null;
            }
        );
    }

    assessLexicalizationModel() {
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        this.metadataRegistryService.assessLexicalizationModel(new ARTURIResource(this.selectedDataset.dataset.identity)).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    addEmbeddedLexicalizationSet() {
        const modalRef: NgbModalRef = this.modalService.open(NewEmbeddedLexicalizationModal, new ModalOptions());
        modalRef.componentInstance.catalogRecordIdentity = this.selectedDataset.dataset.identity;
        return modalRef.result.then(
            () => {
                this.initEmbeddedLexicalizationSets();
            },
            () => {}
        );
    }

    deleteEmbeddedLexicalizationSet() {
        this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new ARTURIResource(this.selectedLexicalizationSet.identity)).subscribe(
            stResp => {
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    deleteAllEmbeddedLexicalizationSet() {
        let deleteFn: any[] = [];
        this.lexicalizationSets.forEach(ls => {
            deleteFn.push(this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new ARTURIResource(ls.identity)));
        });
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        forkJoin(deleteFn).subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        )

    }


    //Authorizations

    isAddDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryCreate);
    }
    isRemoveDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryDelete);
    }
    isEditDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryUpdate);
    }

    isAddEmbeddedLexicalizationSetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryCreate);
    }
    isRemoveEmbeddedLexicalizationSetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryDelete);
    }
    

}