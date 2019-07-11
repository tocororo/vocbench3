import { Component, ElementRef, ViewChild } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ARTURIResource } from "../../models/ARTResources";
import { CatalogRecord, DatasetMetadata, LexicalizationSetMetadata } from "../../models/Metadata";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { NewCatalogRecordModal, NewCatalogRecordModalData } from "./newCatalogRecordModal";
import { NewDatasetVersionModal, NewDatasetVersionModalData } from "./newDatasetVersionModal";
import { NewEmbeddedLexicalizationModal, NewEmbeddedLexicalizationModalData } from "./newEmbeddedLexicalizationModal";

@Component({
    selector: "metadata-registry-component",
    templateUrl: "./metadataRegistryComponent.html",
    host: { class: "pageComponent" },
    styles: [`.activePanel { border: 2px solid #cde8ff; border-radius: 6px; }`]
})
export class MetadataRegistryComponent {

    @ViewChild('blockDiv') lexSetBlockDivElement: ElementRef;

    private catalogs: CatalogRecord[];
    private selectedCatalog: CatalogRecord;
    private activeDatasetMetadata: DatasetMetadata; //dataset of the selected CatalogRecord
    private selectedVersion: DatasetMetadata;

    private lexicalizationSets: LexicalizationSetMetadata[] = [];
    private selectedLexicalizationSet: LexicalizationSetMetadata;
    
    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices, private modal: Modal) { }

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
                this.activeDatasetMetadata = null;
                this.selectedVersion = null;
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
            this.selectedVersion = null;
            this.lexicalizationSets = [];
            this.initActiveDatasetMetadata();
        }
    }

    private initActiveDatasetMetadata() {
        this.metadataRegistryService.getDatasetMetadata(new ARTURIResource(this.selectedCatalog.abstractDataset.identity)).subscribe(
            dataset => {
                this.activeDatasetMetadata = dataset;
                this.initEmbeddedLexicalizationSets();
            }
        )
    }

    private onDatasetUpdate() {
        this.initActiveDatasetMetadata();
    }

    private discoverDataset() {
        this.basicModals.prompt("Discover Dataset", "Dataset IRI").then(
            iri => {
                if (ResourceUtils.testIRI(iri)) {
                    this.metadataRegistryService.discoverDataset(new ARTURIResource(iri)).subscribe(
                        stResp => {
                            this.initCatalogRecords();        
                        }
                    );
                } else {
                    this.basicModals.alert("Invalid IRI", "'" + iri + "' is not a valid IRI");
                }
            }
        )   
    }

    private addCatalogRecord() {
        var modalData = new NewCatalogRecordModalData("New Catalog Record");
        const builder = new BSModalContextBuilder<NewCatalogRecordModalData>(
            modalData, undefined, NewCatalogRecordModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(NewCatalogRecordModal, overlayConfig).result.then(
            ok => {
                this.initCatalogRecords();
            },
            () => {}
        );
    }

    private deleteCatalogRecord() {
        this.metadataRegistryService.deleteCatalogRecord(new ARTURIResource(this.selectedCatalog.identity)).subscribe(
            stResp => {
                this.initCatalogRecords();
            }
        );
    }

    /**
     * Dataset version
     */

    private addDatasetVersion() {
        var modalData = new NewDatasetVersionModalData(this.selectedCatalog.identity);
        const builder = new BSModalContextBuilder<NewDatasetVersionModalData>(
            modalData, undefined, NewDatasetVersionModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewDatasetVersionModal, overlayConfig).result.then(
            ok => {
                this.initCatalogRecords(this.selectedCatalog.identity);
            },
            () => {}
        );
    }

    private deleteDatasetVersion() {
        this.metadataRegistryService.deleteDatasetVersion(new ARTURIResource(this.selectedVersion.identity)).subscribe(
            stResp => {
                this.initCatalogRecords();
            }
        );
    }

    private onVersionUpdate() {
        this.initCatalogRecords(this.selectedCatalog.identity);
    }

    /**
     * Lexicalization sets
     */

    private initEmbeddedLexicalizationSets() {
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        this.metadataRegistryService.getEmbeddedLexicalizationSets(new ARTURIResource(this.selectedCatalog.abstractDataset.identity)).subscribe(
            sets => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.lexicalizationSets = sets;
                this.selectedLexicalizationSet = null;
            }
        );
    }

    private assessLexicalizationModel() {
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        this.metadataRegistryService.assessLexicalizationModel(new ARTURIResource(this.selectedCatalog.abstractDataset.identity)).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    private addEmbeddedLexicalizationSet() {
        var modalData = new NewEmbeddedLexicalizationModalData(this.selectedCatalog.abstractDataset.identity);
        const builder = new BSModalContextBuilder<NewEmbeddedLexicalizationModalData>(
            modalData, undefined, NewEmbeddedLexicalizationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(NewEmbeddedLexicalizationModal, overlayConfig).result.then(
            ok => {
                this.initEmbeddedLexicalizationSets();
            },
            () => {}
        );
    }

    private deleteEmbeddedLexicalizationSet() {
        this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new ARTURIResource(this.selectedLexicalizationSet.identity)).subscribe(
            stResp => {
                this.initEmbeddedLexicalizationSets();
            }
        );
    }

    private deleteAllEmbeddedLexicalizationSet() {
        let deleteFn: any[] = [];
        this.lexicalizationSets.forEach(ls => {
            deleteFn.push(this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new ARTURIResource(ls.identity)));
        });
        UIUtils.startLoadingDiv(this.lexSetBlockDivElement.nativeElement);
        Observable.forkJoin(deleteFn).subscribe(
            resp => {
                UIUtils.stopLoadingDiv(this.lexSetBlockDivElement.nativeElement);
                this.initEmbeddedLexicalizationSets();
            }
        )

    }


    //Authorizations

    private isAddDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryCreate);
    }
    private isRemoveDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryDelete);
    }
    private isEditDatasetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryUpdate);
    }

    private isAddEmbeddedLexicalizationSetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryCreate);
    }
    private isRemoveEmbeddedLexicalizationSetAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryDelete);
    }
    

}