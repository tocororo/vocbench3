import { Component, ElementRef, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from "rxjs";
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { CatalogRecord2, LexicalizationSetMetadata } from "../../models/Metadata";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { NewEmbeddedLexicalizationModal } from "./newEmbeddedLexicalizationModal";

@Component({
    selector: "metadata-registry-component",
    templateUrl: "./metadataRegistryComponent.html",
    host: { class: "pageComponent" },
    styles: [`.activePanel { border: 2px solid #cde8ff; border-radius: 6px; }`]
})
export class MetadataRegistryComponent {

    @ViewChild('blockDiv', { static: false }) lexSetBlockDivElement: ElementRef;

    // catalogRecords: CatalogRecord[]; //list of catalog (shown to the left)
    // selectedCatalogRecord: CatalogRecord; //selected catalog. Contains the dataset metadata (which is also retrieved and stored in catalogRecordDataset var) and the other versions
    selectedCatalogRecord2: CatalogRecord2;
    // catalogRecordDataset: DatasetMetadata; //metadata of the selected record
    // selectedDataset: { dataset: DatasetMetadata, isVersion?: boolean }; //can be the catalogRecordDataset itself or one of its version

    lexicalizationSets: LexicalizationSetMetadata[] = []; //lex set of the selected dataset
    selectedLexicalizationSet: LexicalizationSetMetadata;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices, private translateService: TranslateService, private modalService: NgbModal) { }

    // ngOnInit() {
    //     this.initCatalogRecords();
    // }

    /**
     * Catalog records
     */

    /**
     * Initializes/refreshes the catalog records
     * @param catalogToSelectIdentity the identity of the catalog to select (useful to restore the selection of the record after a refresh)
     * @param versionToSelectIdentity the identity of a dataset (the main/abstract one, or a version) to select (useful to restore the selection of a version after a refresh)
     */
    // private initCatalogRecords() {
    //     this.metadataRegistryService.getCatalogRecords().subscribe(
    //         catalogs => {
    //             this.catalogRecords = catalogs;
    //             this.lexicalizationSets = [];
    //             //try to restore the selection of a previous selected record (if any)
    //             if (this.selectedCatalogRecord != null) {
    //                 this.catalogRecords.forEach(c => {
    //                     if (c.identity == this.selectedCatalogRecord.identity) {
    //                         this.selectCatalogRecord(c);
    //                     }
    //                 });
    //             }
    //         }
    //     );
    // }

    // private selectCatalogRecord(catalog: CatalogRecord) {
    //     if (this.selectedCatalogRecord != catalog) {
    //         this.selectedCatalogRecord = catalog;
    //         this.lexicalizationSets = [];
    //         this.initSelectedCatalogDataset();
    //     }
    // }

    onCatalogSelected(catalogRecord: CatalogRecord2) {
        this.selectedCatalogRecord2 = catalogRecord;
        if (this.selectedCatalogRecord2 != null) { //onCatalogSelected is invoked also when tree is initialized/refreshed and the selected node of the tree is nulls 
            setTimeout(() => {
                this.initEmbeddedLexicalizationSets();
            });
        }
    }

    /**
     * Init the dataset of the selected catalog record
     */
    // private initSelectedCatalogDataset() {
    //     this.metadataRegistryService.getDatasetMetadata(new ARTURIResource(this.selectedCatalogRecord.abstractDataset.identity)).subscribe(
    //         dataset => {
    //             this.catalogRecordDataset = dataset;
    //             setTimeout(() => {
    //                 //restore selection of dataset
    //                 if (this.selectedDataset != null && this.selectedDataset.isVersion) {
    //                     //restore a version
    //                     let versionToRestore = this.selectedCatalogRecord.versions.find(v => v.identity == this.selectedDataset.dataset.identity);
    //                     if (versionToRestore != null) { //could be null in case catalog records has changed, so the previous selected version was of another dataset
    //                         this.selectVersion(versionToRestore);
    //                     } else {
    //                         this.selectCatalogDataset();    
    //                     }
    //                 } else { //restore or select the abstract/main dataset if it was not any selected dataset or if it was previously selected
    //                     this.selectCatalogDataset();
    //                 }
    //             });
    //         }
    //     );
    // }

    // discoverDataset() {
    //     this.basicModals.prompt({ key: "METADATA.METADATA_REGISTRY.ACTIONS.DISCOVER_DATASET" }, {
    //         value: "Resource IRI", tooltip: "This IRI can be directly the IRI of the VoID description " +
    //             "of the Dataset (the instance of void:Dataset) or the IRI of any resource in the Dataset that points to this VoID description"
    //     }).then(
    //         iri => {
    //             if (ResourceUtils.testIRI(iri)) {
    //                 UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
    //                 this.metadataRegistryService.discoverDataset(new ARTURIResource(iri)).subscribe(
    //                     stResp => {
    //                         UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
    //                         this.initCatalogRecords();
    //                     }
    //                 );
    //             } else {
    //                 this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: iri } });
    //             }
    //         }
    //     );
    // }

    // addCatalogRecord() {
    //     const modalRef: NgbModalRef = this.modalService.open(NewCatalogRecordModal, new ModalOptions());
    //     modalRef.componentInstance.title = TranslationUtils.getTranslatedText({key: "METADATA.METADATA_REGISTRY.ACTIONS.ADD_CATALOG_RECORD"}, this.translateService);
    //     return modalRef.result.then(
    //         () => {
    //             this.initCatalogRecords();
    //         },
    //         () => { }
    //     );
    // }

    // deleteCatalogRecord() {
    //     this.metadataRegistryService.deleteCatalogRecord(new ARTURIResource(this.selectedCatalogRecord.identity)).subscribe(
    //         () => {
    //             this.catalogRecordDataset = null;
    //             this.initCatalogRecords();
    //         }
    //     );
    // }

    /**
     * Dataset and versions
     */

    // /**
    //  * select the main dataset of the catalog record
    //  */
    // selectCatalogDataset() {
    //     if (this.selectedDataset && this.selectedDataset.dataset == this.catalogRecordDataset) return; //skip if already selected
    //     this.selectedDataset = { dataset: this.catalogRecordDataset, isVersion: false };
    //     this.initEmbeddedLexicalizationSets();
    // }
    // /**
    //  * Select a version of the dataset
    //  */
    // selectVersion(v: DatasetMetadata) {
    //     if (this.selectedDataset && this.selectedDataset.dataset == v) return; //skip if already selected
    //     this.selectedDataset = { dataset: v, isVersion: true };
    //     this.initEmbeddedLexicalizationSets();
    // }

    // addDatasetVersion() {
    //     const modalRef: NgbModalRef = this.modalService.open(NewDatasetVersionModal, new ModalOptions());
    //     modalRef.componentInstance.catalogRecordIdentity = this.selectedCatalogRecord.identity;
    //     return modalRef.result.then(
    //         () => {
    //             this.initCatalogRecords();
    //         },
    //         () => { }
    //     );
    // }

    // deleteDatasetVersion() {
    //     if (this.selectedDataset.isVersion) {
    //         this.metadataRegistryService.deleteDatasetVersion(new ARTURIResource(this.selectedDataset.dataset.identity)).subscribe(
    //             stResp => {
    //                 this.selectedDataset = null;
    //                 this.initCatalogRecords();
    //             }
    //         );
    //     }
    // }
    
    // onDatasetUpdate() {
    //     this.initSelectedCatalogDataset();
    // }

    // onVersionUpdate() {
    //     this.initCatalogRecords();
    // }

    /**
     * Lexicalization sets
     */

    private initEmbeddedLexicalizationSets() {
        // UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        // this.metadataRegistryService.getEmbeddedLexicalizationSets(new ARTURIResource(this.selectedDataset.dataset.identity)).subscribe(
        //     sets => {
        //         UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        //         this.lexicalizationSets = sets;
        //         this.selectedLexicalizationSet = null;
        //     }
        // );
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        this.metadataRegistryService.getEmbeddedLexicalizationSets(this.selectedCatalogRecord2.dataset.identity).subscribe(
            sets => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.lexicalizationSets = sets;
                this.selectedLexicalizationSet = null;
            }
        );
    }

    assessLexicalizationModel() {
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        this.metadataRegistryService.assessLexicalizationModel(this.selectedCatalogRecord2.dataset.identity).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    addEmbeddedLexicalizationSet() {
        const modalRef: NgbModalRef = this.modalService.open(NewEmbeddedLexicalizationModal, new ModalOptions());
        modalRef.componentInstance.catalogRecordIdentity = this.selectedCatalogRecord2.dataset.identity;
        return modalRef.result.then(
            () => {
                this.initEmbeddedLexicalizationSets();
            },
            () => { }
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
        );

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