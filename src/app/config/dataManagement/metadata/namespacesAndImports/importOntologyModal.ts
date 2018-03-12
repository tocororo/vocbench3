import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { OntoManagerServices } from '../../../../services/ontoManagerServices';
import { ExportServices } from '../../../../services/exportServices';
import { RDFFormat } from '../../../../models/RDFFormat';
import { ImportType, TransitiveImportMethodAllowance } from '../../../../models/Metadata';

export class ImportOntologyModalData extends BSModalContext {
    /**
     * @param title modal title
     */
    constructor(
        public title: string = "Modal Title",
        public importType: ImportType, //'fromWeb' | 'fromWebToMirror' | 'fromLocalFile' | 'fromOntologyMirror'
        public baseURI?: string
    ) {
        super();
    }
}

@Component({
    selector: "import-ontology-modal",
    templateUrl: "./importOntologyModal.html",
})
export class ImportOntologyModal implements ModalComponent<ImportOntologyModalData> {
    context: ImportOntologyModalData;

    private baseURI: string; //used for type "fromWeb", "fromWebToMirror", "fromLocalFile"
    private baseURIdisabled: boolean = false;

    private localFile: File; //used for type "fromLocalFile"

    private mirrorFile: string; //used for type "fromWebToMirror", "fromLocalFile"

    private altURLCheck: boolean = false; //used for type "fromWeb", "fromWebToMirror"
    private altURL: string; //used for type "fromWeb", "fromWebToMirror"

    private forceFormatCheck: boolean = false; //used for type "fromWeb", "fromWebToMirror"
    private formats: RDFFormat[];
    private rdfFormat: RDFFormat; //used for type "fromWeb", "fromWebToMirror"

    private mirrorList: Array<{ file: string, baseURI: string }>; //used for type "fromOntologyMirror"
    private selectedMirror: { file: string, baseURI: string }; //used for type "fromOntologyMirror"

    private importAllowances: { allowance: TransitiveImportMethodAllowance, show: string }[] = [
        { allowance: TransitiveImportMethodAllowance.web, show: "Web" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, show: "Web with fallback to Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirror, show: "Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, show: "Ontology Mirror with fallback to Web" }
    ];
    private selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[0].allowance;

    constructor(public dialog: DialogRef<ImportOntologyModalData>, public ontoMgrService: OntoManagerServices, public exportService: ExportServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        //init mirror list if modal import type is fromOntologyMirror
        if (this.context.importType == ImportType.fromOntologyMirror) {
            this.ontoMgrService.getOntologyMirror().subscribe(
                mirrors => {
                    this.mirrorList = mirrors;
                }
            );
        }
        //init list of rdfFormats if import type is fromWeb or fromWebToMirror
        if (this.context.importType == ImportType.fromWeb || this.context.importType == ImportType.fromWebToMirror) {
            this.exportService.getOutputFormats().subscribe(
                formats => {
                    this.formats = formats;
                    //select RDF/XML as default
                    for (var i = 0; i < this.formats.length; i++) {
                        if (this.formats[i].name == "RDF/XML") {
                            this.rdfFormat = this.formats[i];
                            return;
                        }
                    }
                }
            );
        }
        if (this.context.baseURI != null) {
            this.baseURI = this.context.baseURI;
            this.baseURIdisabled = true;
        }
    }

    private fileChangeEvent(file: File) {
        this.localFile = file;
    }

    private isOkClickable() {
        if (this.context.importType == ImportType.fromWeb) {
            var baseuriOk = (this.baseURI != undefined && this.baseURI.trim() != "");
            var alturlOk = (!this.altURLCheck || (this.altURLCheck && this.altURL != undefined && this.altURL.trim() != ""));
            var rdfFormatOk = (!this.forceFormatCheck || this.forceFormatCheck && this.rdfFormat != undefined);
            return (baseuriOk && alturlOk && rdfFormatOk);
        } else if (this.context.importType == ImportType.fromWebToMirror) {
            var baseuriOk = (this.baseURI != undefined && this.baseURI.trim() != "");
            var mirrorFileOk = (this.mirrorFile != undefined && this.mirrorFile.trim() != "");
            var alturlOk = (!this.altURLCheck || (this.altURLCheck && this.altURL != undefined && this.altURL.trim() != ""));
            var rdfFormatOk = (!this.forceFormatCheck || this.forceFormatCheck && this.rdfFormat != undefined);
            return (baseuriOk && mirrorFileOk && alturlOk && rdfFormatOk);
        } else if (this.context.importType == ImportType.fromLocalFile) {
            var baseuriOk = (this.baseURI != undefined && this.baseURI.trim() != "");
            var localFileOk = this.localFile != undefined;
            var mirrorFileOk = (this.mirrorFile != undefined && this.mirrorFile.trim() != "");
            return (baseuriOk && localFileOk && mirrorFileOk);
        } else if (this.context.importType == ImportType.fromOntologyMirror) {
            return this.selectedMirror != undefined;
        }
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        let returnedParam: RDFFormat;
        if (this.forceFormatCheck) {
            returnedParam = this.rdfFormat;
        }
        let returnedAltUrl: string;
        if (this.altURLCheck) {
            returnedAltUrl = this.altURL;
        }
        if (this.context.importType == ImportType.fromWeb) {
            this.dialog.close({
                baseURI: this.baseURI, altURL: returnedAltUrl, rdfFormat: returnedParam,
                transitiveImportAllowance: this.selectedImportAllowance
            });
        } else if (this.context.importType == ImportType.fromWebToMirror) {
            this.dialog.close({
                baseURI: this.baseURI, mirrorFile: this.mirrorFile, altURL: returnedAltUrl,
                rdfFormat: returnedParam, transitiveImportAllowance: this.selectedImportAllowance
            });
        } else if (this.context.importType == ImportType.fromLocalFile) {
            this.dialog.close({
                baseURI: this.baseURI, localFile: this.localFile, mirrorFile: this.mirrorFile,
                transitiveImportAllowance: this.selectedImportAllowance
            });
        } else if (this.context.importType == ImportType.fromOntologyMirror) {
            this.dialog.close({ mirror: this.selectedMirror, transitiveImportAllowance: this.selectedImportAllowance });
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}