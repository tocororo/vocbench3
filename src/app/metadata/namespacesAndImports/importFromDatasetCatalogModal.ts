import { Component } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { DatasetCatalogModal, DatasetCatalogModalData, DatasetCatalogModalReturnData } from "../../config/dataManagement/datasetCatalog/datasetCatalogModal";
import { TransitiveImportMethodAllowance } from "../../models/Metadata";
import { RDFFormat } from "../../models/RDFFormat";
import { InputOutputServices } from "../../services/inputOutputServices";
import { OntoManagerServices } from "../../services/ontoManagerServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class ImportFromDatasetCatalogModalData extends BSModalContext {
    /**
     * @param title modal title
     */
    constructor(
        public title: string = "Modal Title",
    ) {
        super();
    }
}

@Component({
    selector: "import-datset-catalog-modal",
    templateUrl: "./importFromDatasetCatalogModal.html",
})
export class ImportFromDatasetCatalogModal implements ModalComponent<ImportFromDatasetCatalogModalData> {
    context: ImportFromDatasetCatalogModalData;

    private preloadCatalog: string; //id-title of the datasetCatalog

    private ontologyIRI: string;
    private dataDump: string;
    private useDataDump: boolean = false;

    private lockFormat: boolean = true;
    private formats: RDFFormat[];
    private rdfFormat: RDFFormat;

    private importAllowances: { allowance: TransitiveImportMethodAllowance, show: string }[] = [
        { allowance: TransitiveImportMethodAllowance.nowhere, show: "Do not resolve" },
        { allowance: TransitiveImportMethodAllowance.web, show: "Resolve from web" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, show: "Resolve from web with fallback to Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirror, show: "Resolve from Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, show: "Resolve from Ontology Mirror with fallback to Web" }
    ];
    private selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

    constructor(public dialog: DialogRef<ImportFromDatasetCatalogModalData>, public modal: Modal, public basicModals: BasicModalServices,
        public ontoMgrService: OntoManagerServices, public inOutService: InputOutputServices) {
        this.context = dialog.context;
    }

    private openDatasetCatalog() {
        var modalData = new DatasetCatalogModalData();
        const builder = new BSModalContextBuilder<DatasetCatalogModalData>(
            modalData, undefined, DatasetCatalogModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).dialogClass("modal-dialog modal-xl").toJSON() };
        
        this.modal.open(DatasetCatalogModal, overlayConfig).result.then(
            (data: DatasetCatalogModalReturnData) => {
                this.preloadCatalog = data.dataset.id + " - " + data.dataset.getPreferredTitle().getValue() + " @" + data.dataset.getPreferredTitle().getLang();
                this.ontologyIRI = (data.dataset.ontologyIRI != null) ? data.dataset.ontologyIRI.getURI() : null;
                this.dataDump = data.dataset.dataDump;
                if (this.dataDump != null) {
                    let ext: string = this.dataDump.substring(this.dataDump.lastIndexOf(".")+1);
                    this.formats.forEach(f => {
                        if (f.defaultFileExtension == ext) {
                            this.rdfFormat = f;
                        }
                    });
                }
            }
        );
    }

    ngOnInit() {
        this.inOutService.getInputRDFFormats().subscribe(
            formats => {
                this.formats = formats;
                for (var i = 0; i < this.formats.length; i++) {
                    if (this.formats[i].name == "RDF/XML") { //select RDF/XML as default
                        this.rdfFormat = this.formats[i];
                        break;
                    }
                }
            }
        );
    }

    ok(event: Event) {
        if (this.ontologyIRI == null) {
            this.basicModals.alert("Import from Dataset Catalog", "The selected Dataset does not provide any ontology IRI, " + 
                "so it cannot be imported. Please change the Dataset.", "warning");
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        if (this.useDataDump) {

        }
        let dataDumpPar = (this.useDataDump) ? this.dataDump : null;
        let formatPar: RDFFormat = dataDumpPar != null ? this.rdfFormat : null;

        let returnData: ImportFromDatasetCatalogModalReturnData = {
            ontologyIRI: this.ontologyIRI,
            dataDump: dataDumpPar,
            rdfFormat: formatPar,
            transitiveImportAllowance: this.selectedImportAllowance
        }
        this.dialog.close(returnData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class ImportFromDatasetCatalogModalReturnData {
    ontologyIRI: string;
    dataDump: string;
    rdfFormat: RDFFormat;
    transitiveImportAllowance: TransitiveImportMethodAllowance

}