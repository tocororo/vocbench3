import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { DatasetCatalogModal, DatasetCatalogModalReturnData } from "../../config/dataManagement/datasetCatalog/datasetCatalogModal";
import { TransitiveImportMethodAllowance, TransitiveImportUtils } from "../../models/Metadata";
import { RDFFormat } from "../../models/RDFFormat";
import { InputOutputServices } from "../../services/inputOutputServices";
import { OntoManagerServices } from "../../services/ontoManagerServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "import-datset-catalog-modal",
    templateUrl: "./importFromDatasetCatalogModal.html",
})
export class ImportFromDatasetCatalogModal {
    @Input() title: string;

    preloadCatalog: string; //id-title of the datasetCatalog

    ontologyIRI: string;
    dataDump: string;
    private useDataDump: boolean = false;

    private lockFormat: boolean = true;
    private formats: RDFFormat[];
    private rdfFormat: RDFFormat;

    importAllowances: { allowance: TransitiveImportMethodAllowance, showTranslationKey: string }[] = TransitiveImportUtils.importAllowancesList;
    selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, public basicModals: BasicModalServices,
        public ontoMgrService: OntoManagerServices, public inOutService: InputOutputServices) {
    }

    openDatasetCatalog() {
        const modalRef: NgbModalRef = this.modalService.open(DatasetCatalogModal, new ModalOptions('xl'));
        modalRef.result.then(
            (data: DatasetCatalogModalReturnData) => {
                this.preloadCatalog = data.dataset.id + " - " + data.dataset.getPreferredTitle().getValue() + " @" + data.dataset.getPreferredTitle().getLang();
                this.ontologyIRI = (data.dataset.ontologyIRI != null) ? data.dataset.ontologyIRI.getURI() : null;
                this.dataDump = data.dataDump.accessURL;
                if (this.dataDump != null) {
                    let ext: string = this.dataDump.substring(this.dataDump.lastIndexOf(".")+1);
                    this.formats.forEach(f => {
                        if (f.defaultFileExtension == ext) {
                            this.rdfFormat = f;
                        }
                    });
                }
            },
            () => {}
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

    ok() {
        if (this.ontologyIRI == null) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.CANNOT_IMPORT_DATASET_MISSING_ONTO_IRI"}, ModalType.warning);
            return;
        }


        let dataDumpPar = (this.useDataDump) ? this.dataDump : null;
        let formatPar: RDFFormat = dataDumpPar != null ? this.rdfFormat : null;

        let returnData: ImportFromDatasetCatalogModalReturnData = {
            ontologyIRI: this.ontologyIRI,
            dataDump: dataDumpPar,
            rdfFormat: formatPar,
            transitiveImportAllowance: this.selectedImportAllowance
        }
        this.activeModal.close(returnData);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

export class ImportFromDatasetCatalogModalReturnData {
    ontologyIRI: string;
    dataDump: string;
    rdfFormat: RDFFormat;
    transitiveImportAllowance: TransitiveImportMethodAllowance

}