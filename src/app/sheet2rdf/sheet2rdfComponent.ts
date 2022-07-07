import { ChangeDetectorRef, Component, HostListener, QueryList, ViewChildren } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import { concat, Observable } from "rxjs";
import { last } from 'rxjs/operators';
import { S2RDFModel } from "../models/Sheet2RDF";
import { ExportServices } from "../services/exportServices";
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { HttpServiceContext } from "../utils/HttpManager";
import { VBContext } from '../utils/VBContext';
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from '../widget/modal/Modals';
import { Sheet2RdfSettingsModal } from "./s2rdfModals/sheet2rdfSettingsModal";
import { Sheet2RdfContextService } from "./sheet2rdfContext";
import { SheetManagerComponent } from "./sheetManagerComponent";

@Component({
    selector: "s2rdf-component",
    templateUrl: "./sheet2rdfComponent.html",
    host: {
        class: "pageComponent",
    },
})
export class Sheet2RdfComponent {

    @ViewChildren('multiSheetEditor') sheetEditors: QueryList<SheetManagerComponent>;

    inputSources: { id: InputSource, translationKey: string }[] = [
        { id: InputSource.spreadsheet, translationKey: "SHEET2RDF.SPREADSHEET.FILE" },
        { id: InputSource.database, translationKey: "SHEET2RDF.DATABASE.DATABASE" },
    ];
    selectedInputSource: InputSource = this.inputSources[0].id;

    dbInfo: DatabaseInfo = { db_base_url: null, db_name: null, db_tableList: [], db_user: null, db_password: null, db_driverName: null };
    dbDrivers: string[];

    spreadsheetFile: File;

    s2rdfModel: S2RDFModel = new S2RDFModel();

    sheets: SheetStruct[];
    activeSheet: SheetStruct;

    constructor(private s2rdfService: Sheet2RDFServices, private s2rdfCtx: Sheet2RdfContextService, private exportService: ExportServices,
        private basicModals: BasicModalServices, private modalService: NgbModal, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {

        HttpServiceContext.initSessionToken();

        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.s2rdfCtx.exportFormats = formats;
            }
        );

        this.s2rdfService.getSupportedDBDrivers().subscribe(
            drivers => {
                this.dbDrivers = drivers;
                this.dbInfo.db_driverName = this.dbDrivers[0];
            }
        );
    }

    //use HostListener instead of ngOnDestroy since this component is reused and so it is never destroyed
    @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHandler(event: Event) {
        // close session server side
        this.s2rdfService.closeSession().subscribe();
    }


    loadSpreadsheet() {
        let fsNamingStrategy = VBContext.getWorkingProjectCtx().getProjectPreferences().sheet2RdfSettings.namingStrategy;

        let loadFn: Observable<void>;
        if (this.selectedInputSource == InputSource.spreadsheet) {
            loadFn = this.s2rdfService.uploadSpreadsheet(this.spreadsheetFile, fsNamingStrategy);
        } else {
            loadFn = this.s2rdfService.uploadDBInfo(this.dbInfo.db_base_url, this.dbInfo.db_name, this.dbInfo.db_tableList,
                this.dbInfo.db_user, this.dbInfo.db_password, this.dbInfo.db_driverName, fsNamingStrategy);
        }
        loadFn.subscribe(
            () => {
                this.initSheets();
            }
        );
    }


    private initSheets() {
        this.resetAll();

        this.s2rdfService.listSheetNames().subscribe(
            sheetNames => {
                if (sheetNames.length == 0) {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.INVALID_SPREADSHEET" }, ModalType.warning);
                    return;
                }
                this.sheets = sheetNames.map(s => { return { name: s, exclude: false }; });
                this.activeSheet = this.sheets[0];
            }
        );
    }

    private resetAll() {
        //restore initial state (in case there was a previous sheet loaded)
        this.sheets = null;
        this.s2rdfCtx.memoizeIdList = [];
        this.s2rdfCtx.sheetModelMap = new Map();
    }

    isLoadDbEnabled(): boolean {
        return this.dbInfo.db_base_url != null && this.dbInfo.db_name != null && this.dbInfo.db_tableList.length > 0 &&
            this.dbInfo.db_user != null && this.dbInfo.db_password != null;
    }

    addDbTable() {
        this.basicModals.prompt({ key: "SHEET2RDF.DATABASE.DB_TABLES" }, { value: { key: "COMMONS.NAME" } }).then(
            tableName => {
                if (!this.dbInfo.db_tableList.includes(tableName)) {
                    this.dbInfo.db_tableList.push(tableName);
                }
            }
        );
    }

    removeDbTable(table: string) {
        this.dbInfo.db_tableList.splice(this.dbInfo.db_tableList.indexOf(table), 1);
    }

    // Updates the file to load when user change file on from filepicker
    fileChangeEvent(file: File) {
        this.spreadsheetFile = file;
        this.loadSpreadsheet();
    }

    //== Global actions ==

    generateAllPearl() {
        let globalActionEditors = this.getMultisheetActionEditors();
        globalActionEditors.forEach(e => {
            e.generatePearl();
        });
    }

    generateAllTriples() {
        let globalActionEditors = this.getMultisheetActionEditors();
        for (let e of globalActionEditors) {
            if (e.pearl == null || e.pearlValidation == null || !e.pearlValidation.valid) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, "Sheet " + e.sheetName + " has incomplete or invalid Pearl code. Pleas fix the Pearl or exclude the sheet from the process, then retry.", ModalType.warning);
                return;
            }
        }
        let multiActions: Observable<void>[] = [];
        globalActionEditors.forEach(e => {
            multiActions.push(e.generateTriples());
        });
        if (multiActions.length > 0) {
            concat(...multiActions).subscribe(() => { });
        }
    }

    addAllTriples() {
        let globalActionEditors = this.getMultisheetActionEditors();

        let multiActions: Observable<void>[] = [];
        globalActionEditors.forEach(e => {
            multiActions.push(e.addTriples(false));
        });
        if (multiActions.length > 0) {
            concat(...multiActions)
                .pipe(last()) //in order to execute the alert (in subscribe()) only for the last subscription 
                .subscribe(
                    () => {
                        this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.GENERATED_TRIPLES_ADDED" });
                    }
                );

        }
    }

    private getMultisheetActionEditors(): SheetManagerComponent[] {
        //collect editor which are not exclude from global actions
        let globalActionEditors = this.sheetEditors.filter(e => !this.sheets.find(s => s.name == e.sheetName).exclude);
        if (globalActionEditors.length == 0) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "No sheet included in multi sheet action" }, ModalType.warning);
        }
        return globalActionEditors;
    }

    exportStatus() {
        this.s2rdfService.exportGlobalStatus().subscribe(
            blob => {
                let fileName = (this.selectedInputSource == InputSource.spreadsheet ? this.spreadsheetFile.name : this.dbInfo.db_name) + " - status.json";
                FileSaver.saveAs(blob, fileName);
            }
        );
    }

    loadStatus(statusFile: File) {
        this.s2rdfService.importGlobalStatus(statusFile).subscribe(
            () => {
                //makes all sheet reset and reload
                let tmp = this.sheets;
                this.sheets = null;
                this.changeDetectorRef.detectChanges();
                this.sheets = tmp;
            }
        );
    }

    //======================

    openSettings() {
        const modalRef: NgbModalRef = this.modalService.open(Sheet2RdfSettingsModal, new ModalOptions());
        modalRef.result.then(
            () => { //fs naming strategy changed
                this.loadSpreadsheet();
            },
            () => { }
        );
    }


}


enum InputSource {
    spreadsheet = "spreadsheet",
    database = "database"
}

interface DatabaseInfo {
    db_base_url: string;
    db_name: string;
    db_tableList: string[];
    db_user: string;
    db_password: string;
    db_driverName: string;
}

interface SheetStruct {
    name: string;
    exclude: boolean; //tells if editor is excluded from global actions
}