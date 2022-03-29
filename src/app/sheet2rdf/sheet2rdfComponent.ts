import { Component, HostListener } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID, Scope } from "../models/Plugins";
import { SettingsEnum } from "../models/Properties";
import { FsNamingStrategy, S2RDFModel, Sheet2RdfSettings } from "../models/Sheet2RDF";
import { ExportServices } from "../services/exportServices";
import { SettingsServices } from "../services/settingsServices";
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { HttpServiceContext } from "../utils/HttpManager";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions } from '../widget/modal/Modals';
import { Sheet2RdfSettingsModal } from "./s2rdfModals/sheet2rdfSettingsModal";
import { Sheet2RdfContextService } from "./sheet2rdfContext";

@Component({
    selector: "s2rdf-component",
    templateUrl: "./sheet2rdfComponent.html",
    host: { 
        class: "pageComponent",
    },
})
export class Sheet2RdfComponent {

    //preferences
    private useHeader: boolean = true; //currently not used
    private fsNamingStrategy: FsNamingStrategy = FsNamingStrategy.columnNumericIndex;

    inputSources: { id: InputSource, translationKey: string }[] = [
        { id: InputSource.spreadsheet, translationKey: "SHEET2RDF.SPREADSHEET.FILE" },
        { id: InputSource.database, translationKey: "SHEET2RDF.DATABASE.DATABASE" },
    ];
    selectedInputSource: InputSource = this.inputSources[0].id;

    dbInfo: DatabaseInfo = { db_base_url: null, db_name: null, db_table: null, db_user: null, db_password: null, db_driverName: null };
    dbDrivers: string[];

    spreadsheetFile: File;

    s2rdfModel: S2RDFModel = new S2RDFModel();

    sheetNames: string[];
    activeSheet: string;


    constructor(private s2rdfService: Sheet2RDFServices, private s2rdfCtx: Sheet2RdfContextService, private exportService: ExportServices, 
        private settingsService: SettingsServices, private basicModals: BasicModalServices, private modalService: NgbModal) {}

    ngOnInit() {

        HttpServiceContext.initSessionToken();

        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.s2rdfCtx.exportFormats = formats;
            }
        );
        
        //init settings
        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.PROJECT_USER).subscribe(
            settings => {
                let s2rdfSettings: Sheet2RdfSettings = settings.getPropertyValue(SettingsEnum.sheet2rdfSettings);
                if (s2rdfSettings == null) {
                    s2rdfSettings = new Sheet2RdfSettings();
                }
                this.useHeader = s2rdfSettings.useHeaders;
                this.fsNamingStrategy = s2rdfSettings.namingStrategy;
            }
        );

        this.s2rdfService.getSupportedDBDrivers().subscribe(
            drivers => {
                this.dbDrivers = drivers;
                this.dbInfo.db_driverName = this.dbDrivers[0];
            }
        )
    }

    //use HostListener instead of ngOnDestroy since this component is reused and so it is never destroyed
    @HostListener('window:beforeunload', [ '$event' ])
    beforeUnloadHandler(event: Event) {
        // close session server side
        this.s2rdfService.closeSession().subscribe();
    }

    /* ==========================================================
     * SPREADSHEET HANDLERS
     * ========================================================== */


    loadSpreadsheet() {
        this.s2rdfService.uploadSpreadsheet(this.spreadsheetFile, this.fsNamingStrategy).subscribe(
            () => {
                this.resetAll();

                this.s2rdfService.listSheetNames().subscribe(
                    sheetNames => {
                        this.sheetNames = sheetNames;
                        this.activeSheet = sheetNames[0];
                    }
                );
            }
        );
    }

    loadDbInfo() {
        this.s2rdfService.uploadDBInfo(this.dbInfo.db_base_url, this.dbInfo.db_name, this.dbInfo.db_table, 
            this.dbInfo.db_user, this.dbInfo.db_password, this.dbInfo.db_driverName, this.fsNamingStrategy).subscribe(
            () => {
                this.resetAll();
            }
        );
    }

    private resetAll() {
        //restore initial state (in case there was a previous sheet loaded)
        this.sheetNames = null;
        this.s2rdfCtx.memoizeIdList = [];
        this.s2rdfCtx.sheetModelMap = new Map();
    }

    // Updates the file to load when user change file on from filepicker
    fileChangeEvent(file: File) {
        this.spreadsheetFile = file;
        this.loadSpreadsheet();
    }


    exportStatus() {
        this.s2rdfService.exportGlobalStatus().subscribe(
            blob => {
                let exportLink = window.URL.createObjectURL(blob);
                let fileName = (this.selectedInputSource == InputSource.spreadsheet ? this.spreadsheetFile.name : this.dbInfo.db_name) + " - status.json";
                this.basicModals.downloadLink({key:"SHEET2RDF.ACTIONS.EXPORT_MAPPING_STATUS"}, null, exportLink, fileName);
            }
        );
    }

    loadStatus(statusFile: File) {
        this.s2rdfService.importGlobalStatus(statusFile).subscribe(
            () => {
                //makes all sheet reset and reload
                let tmp = this.sheetNames;
                this.sheetNames = null;
                setTimeout(() => {
                    this.sheetNames = tmp;
                })
            }
        )
    }

    //======================

    settings() {
        const modalRef: NgbModalRef = this.modalService.open(Sheet2RdfSettingsModal, new ModalOptions());
        modalRef.componentInstance.fsNamingStrategyInput = this.fsNamingStrategy;
        modalRef.result.then(
            (newFsNamingStrategy: FsNamingStrategy) => {
                this.fsNamingStrategy = newFsNamingStrategy;
                this.loadSpreadsheet();
            },
            () => {}
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
    db_table: string;
    db_user: string;
    db_password: string;
    db_driverName: string;
}