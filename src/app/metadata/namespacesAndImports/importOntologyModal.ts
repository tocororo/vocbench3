import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ImportType, OntologyMirror, TransitiveImportMethodAllowance } from "../../models/Metadata";
import { RDFFormat } from "../../models/RDFFormat";
import { ExportServices } from "../../services/exportServices";
import { OntoManagerServices } from "../../services/ontoManagerServices";

export class ImportOntologyModalData extends BSModalContext {
    /**
     * @param title modal title
     */
    constructor(
        public title: string = "Modal Title",
        public importType: ImportType, //'fromWeb' | 'fromWebToMirror' | 'fromLocalFile' | 'fromOntologyMirror'
        public baseURI?: string //baseURI of the imported ontology (provided only when repairing)
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

    private editorMode: EditorMode = EditorMode.import;

    private baseURIOptional: boolean;
    private baseURICheck: boolean; //used for type "fromLocalFile" (its value is computed in the method ngOnInit())
    private baseURI: string; //used for type "fromWeb", "fromWebToMirror", "fromLocalFile"

    private localFile: File; //used for type "fromLocalFile"

    private mirrorFileOptional: boolean;
    private mirrorFileCheck: boolean; //used for type "fromWebToMirror", "fromLocalFile" (its value is computed in the method ngOnInit())
    private mirrorFile: string; //used for type "fromWebToMirror", "fromLocalFile"

    private altURLCheck: boolean = false; //used for type "fromWeb", "fromWebToMirror"
    private altURL: string; //used for type "fromWeb", "fromWebToMirror"

    private forceFormatCheck: boolean = false; //used for type "fromWeb", "fromWebToMirror"
    private formats: RDFFormat[];
    private rdfFormat: RDFFormat; //used for type "fromWeb", "fromWebToMirror"

    private mirrorList: OntologyMirror[]; //used for type "fromOntologyMirror"
    private selectedMirror: OntologyMirror; //used for type "fromOntologyMirror"

    private importAllowances: { allowance: TransitiveImportMethodAllowance, show: string }[] = [
        { allowance: TransitiveImportMethodAllowance.nowhere, show: "Do not resolve" },
        { allowance: TransitiveImportMethodAllowance.web, show: "Resolve from web" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, show: "Resolve from web with fallback to Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirror, show: "Resolve from Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, show: "Resolve from Ontology Mirror with fallback to Web" }
    ];
    private selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

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
                    for (let i = 0; i < this.formats.length; i++) {
                        if (this.formats[i].name == "RDF/XML") {
                            this.rdfFormat = this.formats[i];
                            return;
                        }
                    }
                }
            );
        }
        if (this.context.baseURI != null) {
            this.editorMode = EditorMode.repair;
            this.baseURI = this.context.baseURI;
        }
        //baseURI is always mandatory, except in import from local file
        this.baseURIOptional = this.editorMode == EditorMode.import && this.context.importType == ImportType.fromLocalFile;
        //mirror file is mandatory in import fromMirror, fromWebToMirror and in repair fromWebToMirror. Optional in import and repair fromLocalFile
        this.mirrorFileOptional = this.context.importType == ImportType.fromLocalFile;
    }

    private fileChangeEvent(file: File) {
        this.localFile = file;
    }

    private isOkClickable() {
        /* 
        in the following checks, selectedImportAllowance is never checked since (even it is mandatory) it is automatically set through the combobox.
        Moreover, some checks may be the same for both import and repair (e.g. in fromWeb or fromWebToMirror), 
        but I prefer to keep them separated (using if-else clause) so if the optional/mandatory parameters changes for the given scenario, 
        it will be easier to fix the conditions.
        */
        if (this.context.importType == ImportType.fromWeb) {
            if (this.editorMode == EditorMode.import) { 
                //baseURI required, other params optional
                return this.baseURI != null && this.baseURI.trim() != "" && //baseURI valid
                    (!this.altURLCheck || this.altURL != null && this.altURL.trim() != "") && //altURL not checked, or checked and valid
                    (!this.forceFormatCheck || this.rdfFormat != null); //format not checked or checked and selected
            } else { //repair
                //baseURI required, other params optional
                return this.baseURI != null && this.baseURI.trim() != "" && //baseURI valid
                    (!this.altURLCheck || this.altURL != null && this.altURL.trim() != "") && //altURL not checked, or checked and valid
                    (!this.forceFormatCheck || this.rdfFormat != null); //format not checked or checked and selected
            }
        } else if (this.context.importType == ImportType.fromWebToMirror) {
            if (this.editorMode == EditorMode.import) { 
                //baseURI and mirrorFile required, other params optional
                return this.baseURI != null && this.baseURI.trim() != "" && //baseURI valid
                    this.mirrorFile != null && this.mirrorFile.trim() != "" && //mirrorFile valid
                    (!this.altURLCheck || this.altURL != null && this.altURL.trim() != "") && //altURL not checked, or checked and valid
                    (!this.forceFormatCheck || this.rdfFormat != null); //format not checked or checked and selected
            } else {
                //baseURI and mirrorFile required, other params optional
                return this.baseURI != null && this.baseURI.trim() != "" && //baseURI valid
                    this.mirrorFile != null && this.mirrorFile.trim() != "" && //mirrorFile valid
                    (!this.altURLCheck || this.altURL != null && this.altURL.trim() != "") && //altURL not checked, or checked and valid
                    (!this.forceFormatCheck || this.rdfFormat != null); //format not checked or checked and selected
            }
        } else if (this.context.importType == ImportType.fromLocalFile) {
            if (this.editorMode == EditorMode.import) { 
                //local file required, other param optional
                return this.localFile != null && //localFile provided
                    (!this.baseURICheck || this.baseURI != null && this.baseURI.trim() != "") && //baseURI not checked, or checked and valid
                    (!this.mirrorFileCheck || this.mirrorFile != null && this.mirrorFile.trim() != "") //mirrorFile not checked, or checked and valid
            } else {
                //baseURI and localFile required, other optional
                return this.baseURI != null && this.baseURI.trim() != "" && //baseURI valid
                    this.localFile != null && //localFile provided
                    (!this.mirrorFileCheck || this.mirrorFile != null && this.mirrorFile.trim() != "") //mirrorFile not checked, or checked and valid
            }
        } else if (this.context.importType == ImportType.fromOntologyMirror) {
            //available only import (not repair)
            //baseURI and mirror required
            return this.baseURI != null && this.baseURI.trim() != "" && //baseURI valid
                this.selectedMirror != null;
        }
    }

    ok() {
        if (this.context.importType == ImportType.fromWeb) {
            if (this.editorMode == EditorMode.import) { 
                let returnData: ImportFromWebData = {
                    baseURI: this.baseURI,
                    altURL: this.altURLCheck ? this.altURL : null,
                    rdfFormat: this.forceFormatCheck ? this.rdfFormat : null,
                    transitiveImportAllowance: this.selectedImportAllowance
                }
                this.dialog.close(returnData);
            } else { //repair
                let returnData: RepairFromWebData = {
                    baseURI: this.baseURI,
                    altURL: this.altURLCheck ? this.altURL : null,
                    rdfFormat: this.forceFormatCheck ? this.rdfFormat : null,
                    transitiveImportAllowance: this.selectedImportAllowance
                }
                this.dialog.close(returnData);
            }
        } else if (this.context.importType == ImportType.fromWebToMirror) {
            if (this.editorMode == EditorMode.import) { 
                let returnData: ImportFromWebToMirrorData = {
                    baseURI: this.baseURI,
                    altURL: this.altURLCheck ? this.altURL : null,
                    mirrorFile: this.mirrorFile,
                    rdfFormat: this.forceFormatCheck ? this.rdfFormat : null,
                    transitiveImportAllowance: this.selectedImportAllowance
                }
                this.dialog.close(returnData);
            } else { //repair
                let returnData: RepairFromWebToMirrorData = {
                    baseURI: this.baseURI,
                    altURL: this.altURLCheck ? this.altURL : null,
                    mirrorFile: this.mirrorFile,
                    rdfFormat: this.forceFormatCheck ? this.rdfFormat : null,
                    transitiveImportAllowance: this.selectedImportAllowance
                }
                this.dialog.close(returnData);
            }
        } else if (this.context.importType == ImportType.fromLocalFile) {
            if (this.editorMode == EditorMode.import) { 
                let returnData: ImportFromLocalFileData = {
                    baseURI: this.baseURICheck ? this.baseURI : null,
                    localFile: this.localFile,
                    mirrorFile: this.mirrorFileCheck ? this.mirrorFile : null,
                    transitiveImportAllowance: this.selectedImportAllowance
                }
                this.dialog.close(returnData);
            } else { //repair
                let returnData: RepairFromLocalFileData = {
                    baseURI: this.baseURI,
                    localFile: this.localFile,
                    mirrorFile: this.mirrorFileCheck ? this.mirrorFile : null,
                    transitiveImportAllowance: this.selectedImportAllowance
                }
                this.dialog.close(returnData);
            }
        } else if (this.context.importType == ImportType.fromOntologyMirror) {
            //from mirror only import is available (no repair)
            let returnData: ImportFromMirrorData = {
                baseURI: this.baseURI,
                mirror: this.selectedMirror,
                transitiveImportAllowance: this.selectedImportAllowance
            }
            this.dialog.close(returnData);
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}

enum EditorMode {
    import = "import",
    repair = "repair"
}

/** data when importig ontology */

export interface ImportOntologyReturnData {
    transitiveImportAllowance: TransitiveImportMethodAllowance;
}

export interface ImportFromLocalFileData extends ImportOntologyReturnData {
    baseURI?: string;
    localFile: File;
    mirrorFile?: string;
}

export interface ImportFromMirrorData extends ImportOntologyReturnData {
    baseURI: string;
    mirror: OntologyMirror;
}

export interface ImportFromWebData extends ImportOntologyReturnData {
    baseURI: string;
    altURL?: string;
    rdfFormat?: RDFFormat;
}

export interface ImportFromWebToMirrorData extends ImportOntologyReturnData {
    baseURI: string;
    altURL?: string;
    mirrorFile: string;
    rdfFormat?: RDFFormat;
}

/** data when repairing import */

export interface RepairImportReturnData {
    baseURI: string;
    transitiveImportAllowance: TransitiveImportMethodAllowance;
}

export interface RepairFromWebData extends RepairImportReturnData {
    altURL?: string;
    rdfFormat?: RDFFormat;
}

export interface RepairFromWebToMirrorData extends RepairImportReturnData {
    altURL?: string;
    mirrorFile: string;
    rdfFormat?: RDFFormat;
}

export interface RepairFromLocalFileData extends RepairImportReturnData {
    localFile: File;
    mirrorFile?: string;
}