import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {AdministrationServices} from '../../../services/administrationServices';
import {FilePickerComponent} from "../../../widget/filePicker/filePickerComponent";

export class ImportOntologyModalData extends BSModalContext {
    /**
     * @param title modal title
     */
    constructor(
        public title: string = "Modal Title",
        public importType: ImportType
    ) {
        super();
    }
}

@Component({
    selector: "import-ontology-modal",
    templateUrl: "app/src/config/dataManagement/metadata/importOntologyModal.html",
    providers: [AdministrationServices],
    directives: [FilePickerComponent]
})
export class ImportOntologyModal implements ModalComponent<ImportOntologyModalData> {
    context: ImportOntologyModalData;
    
    private baseURI: string; //used for type "fromWeb", "fromWebToMirror", "fromLocalFile"
    private localFile: File; //used for type "fromLocalFile"
    private mirrorFile: string; //used for type "fromWebToMirror", "fromLocalFile"
    private altURLCheck: boolean = false; //used for type "fromWeb", "fromWebToMirror"
    private altURL: string; //used for type "fromWeb", "fromWebToMirror"
    private forceFormatCheck: boolean = false; //used for type "fromWeb", "fromWebToMirror"
    private rdfFormat: string; //used for type "fromWeb", "fromWebToMirror"
    private mirrorList: Array<any>; //used for type "fromOntologyMirror"
    private selectedMirror; //used for type "fromOntologyMirror"
    
    constructor(public dialog: DialogRef<ImportOntologyModalData>, public adminService: AdministrationServices) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
        //init mirror list if modal import type is fromOntologyMirror
        if (this.context.importType == ImportType.fromOntologyMirror) {
            this.adminService.getOntologyMirror().subscribe(
                mirrors => {
                    this.mirrorList = mirrors;
                }
            )
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
    
    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.context.importType == ImportType.fromWeb) {
            this.dialog.close({baseURI: this.baseURI, altURL: this.altURL, rdfFormat: this.rdfFormat});
        } else if (this.context.importType == ImportType.fromWebToMirror) {
            this.dialog.close({baseURI: this.baseURI, mirrorFile: this.mirrorFile, altURL: this.altURL, rdfFormat: this.rdfFormat});
        } else if (this.context.importType == ImportType.fromLocalFile) {
            this.dialog.close({baseURI: this.baseURI, localFile: this.localFile, mirrorFile: this.mirrorFile});
        } else if (this.context.importType == ImportType.fromOntologyMirror) {
            this.dialog.close(this.selectedMirror);
        }
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export type ImportType = "fromWeb" | "fromWebToMirror" | "fromLocalFile" | "fromOntologyMirror";
    
export const ImportType = {
    fromWeb: "fromWeb" as ImportType,
    fromWebToMirror: "fromWebToMirror" as ImportType,
    fromLocalFile: "fromLocalFile" as ImportType,
    fromOntologyMirror: "fromOntologyMirror" as ImportType
};