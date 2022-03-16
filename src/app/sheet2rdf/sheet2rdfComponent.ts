import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PearlValidationResult } from "../models/Coda";
import { ExtensionPointID, Scope } from "../models/Plugins";
import { SettingsEnum } from "../models/Properties";
import { RDFFormat } from "../models/RDFFormat";
import { AdvancedGraphApplication, FsNamingStrategy, GraphApplication, MemoizeContext, S2RDFModel, Sheet2RdfSettings, SimpleGraphApplication, SimpleHeader, SubjectHeader, TableRow, TriplePreview } from "../models/Sheet2RDF";
import { CODAServices } from "../services/codaServices";
import { ExportServices } from "../services/exportServices";
import { SettingsServices } from "../services/settingsServices";
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { HttpServiceContext } from "../utils/HttpManager";
import { UIUtils } from "../utils/UIUtils";
import { PearlEditorComponent } from "../widget/codemirror/pearlEditor/pearlEditorComponent";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from '../widget/modal/Modals';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { HeaderEditorModal } from "./s2rdfModals/headerEditorModal";
import { Sheet2RdfSettingsModal } from "./s2rdfModals/sheet2rdfSettingsModal";
import { SubjectHeaderEditorModal } from "./s2rdfModals/subjectHeaderEditorModal";

@Component({
    selector: "s2rdf-component",
    templateUrl: "./sheet2rdfComponent.html",
    host: { 
        class: "pageComponent",
        '(mousemove)': 'onMousemove($event)',
        '(mouseup)': 'onMouseup()',
        '(mouseleave)': 'onMouseup()'
    },
    styles: [`
        .columnHeader { 
            background: linear-gradient(#f6f9fb, #d4dce9);
            border: 1px solid #a9b4c6 !important;
            text-align: center;
            font-weight: bold;
            padding: 1px 6px;
            white-space: nowrap;
        }
        .spreadsheetCell {
            border: 1px solid #d6d7dc;
            padding: 2px 6px;
            cursor: pointer;
            text-align: center;
            white-space: nowrap;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .oddTablePreviewRow {
            background-color: #eee;
        }
        .configuredHeader { color: green; }
        .partiallyConfiguredHeader { color: orange; } /* only for sheets headers: if partially configured, is better orange since red could be too "warning" */
        .unconfiguredHeader { color: black; }
        .incompleteSubjectHeader { color: red; } /* Only for subject header */
        .ignoredHeader { color: gray; }
    `]
})
export class Sheet2RdfComponent {

    @ViewChild('previewPanel',  { read: ElementRef }) private previewPanelRef: ElementRef;
    @ViewChild('pearlPanel',  { read: ElementRef }) private pearlPanelRef: ElementRef;
    
    @ViewChild('topPanel',  { read: ElementRef }) private topPanelRef: ElementRef;
    @ViewChild('triplesPanel',  { read: ElementRef }) private triplesPanelRef: ElementRef;

    @ViewChild(PearlEditorComponent) viewChildCodemirror: PearlEditorComponent;

    //preferences
    private useHeader: boolean = true;
    private fsNamingStrategy: FsNamingStrategy = FsNamingStrategy.columnNumericIndex;

    inputSources: { id: InputSource, translationKey: string }[] = [
        { id: InputSource.spreadsheet, translationKey: "SHEET2RDF.SPREADSHEET.FILE" },
        { id: InputSource.database, translationKey: "SHEET2RDF.DATABASE.DATABASE" },
    ];
    selectedInputSource: InputSource = this.inputSources[0].id;

    dbInfo: DatabaseInfo = { db_base_url: null, db_name: null, db_table: null, db_user: null, db_password: null, db_driverName: null };
    dbDrivers: string[];


    constructor(private s2rdfService: Sheet2RDFServices, private codaService: CODAServices, private exportService: ExportServices, 
        private settingsService: SettingsServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal) {}

    ngOnInit() {

        HttpServiceContext.initSessionToken();

        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.exportFormats = formats;
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

    spreadsheetFile: File;

    private maxSizePreviews: number = 20;
    truncatedRows: number;
    totalRows: number;
    s2rdfModel: S2RDFModel = new S2RDFModel();
    tablePreview: TableRow[];
    private selectedTablePreviewRow: TableRow;

    loadSpreadsheet() {
        this.s2rdfService.uploadSpreadsheet(this.spreadsheetFile, this.fsNamingStrategy).subscribe(
            () => {
                this.resetAll();
                this.initHeaders();
                this.initTablePreview();
            }
        );
    }

    loadDbInfo() {
        this.s2rdfService.uploadDBInfo(this.dbInfo.db_base_url, this.dbInfo.db_name, this.dbInfo.db_table, 
            this.dbInfo.db_user, this.dbInfo.db_password, this.dbInfo.db_driverName, this.fsNamingStrategy).subscribe(
            () => {
                this.resetAll();
                this.initHeaders();
                this.initTablePreview();
            }
        );
    }

    private resetAll() {
        //restore initial state (in case there was a previous sheet loaded)
        //for sheet preview
        this.resetSheetPreview();
        //for pearl
        this.resetPearlEditor();
        //for triples preview
        this.resetTriplePreview();
    }

    private resetSheetPreview() {
        this.s2rdfModel = new S2RDFModel();
        this.tablePreview = null;
        this.truncatedRows = null;
        this.totalRows = null;
    }

    private initHeaders() {
        this.s2rdfService.getHeaders().subscribe(
            (headers: { subject: SubjectHeader, headers: SimpleHeader[] }) => {
                this.s2rdfModel.subjectHeader = headers.subject;
                this.s2rdfModel.headers = headers.headers;


                //init CSS classes of headers
                this.initSubjHeaderCssClass();
                this.s2rdfModel.headers.forEach(h => this.initHeaderCssClass(h));

                this.initMemoizeIdList();
            }
        );
    }

    /**
     * initialize IDs for the memoization by retrieving them from the node of the subject and the nodes of the headers
     */
    private initMemoizeIdList() {
        MemoizeContext.idList = []; 
        //from subject header
        if (this.s2rdfModel.subjectHeader.node.memoize && this.s2rdfModel.subjectHeader.node.memoizeId != null && !MemoizeContext.idList.includes(this.s2rdfModel.subjectHeader.node.memoizeId)) {
            MemoizeContext.idList.push(this.s2rdfModel.subjectHeader.node.memoizeId);
        }
        //from other headers
        this.s2rdfModel.headers.forEach(h => {
            h.nodes.forEach(n => {
                if (n.memoize && n.memoizeId != null && !MemoizeContext.idList.includes(n.memoizeId)) {
                    MemoizeContext.idList.push(n.memoizeId);
                }
            })
        })
    }

    private initTablePreview() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.s2rdfService.getTablePreview(this.maxSizePreviews).subscribe(
            table => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.truncatedRows = table.returned;
                this.totalRows = table.total;
                this.tablePreview = table.rows;
            }
        )
    }

    // Updates the file to load when user change file on from filepicker
    fileChangeEvent(file: File) {
        this.spreadsheetFile = file;
        this.loadSpreadsheet();
    }

    private initHeaderCssClass(header: SimpleHeader) {
        /**
         * configuredHeader: if there is at least one graph application which its node is defined (converter assigned)
         * unconfiguredHeader: there is no node definition neither graph application for the header
         * incompleteHeader: only one between nodes and graph not defined, or graph application whith node not defined
         */
        if (header.ignore) {
            header['cssClass'] = "ignoredHeader";
            return;
        }
        if (header.graph.length == 0 && header.nodes.length == 0) {
            header['cssClass'] = "unconfiguredHeader";
            return;
        }
        if (header.graph.length > 0 && header.nodes.length > 0) {
            for (let i = 0; i < header.graph.length; i++) {
                let g: GraphApplication = header.graph[i];
                if (g instanceof SimpleGraphApplication) {
                    //SimpleGraphApplication is configured if the property is assigned and if the node of the graph application is defined
                    if (g.property != null) {
                        //property assigned, now check for the node
                        for (let j = 0; j < header.nodes.length; j++) {
                            if (header.nodes[j].nodeId == g.nodeId && header.nodes[j].converter != null) {
                                header['cssClass'] = "configuredHeader";
                                return;
                            }
                        }
                    }
                } else if (g instanceof AdvancedGraphApplication) {
                    //AdvancedGraphApplication is configured if the pattern is defined, and the referenced nodes are defined
                    if (g.pattern != null && g.nodeIds != null && g.nodeIds.length > 0) {
                        let allDefined: boolean = true; //if one referenced node is not defined, this is set to false
                        for (let id of g.nodeIds) { //for each node referenced in graph application
                            this.s2rdfModel.headers.forEach(h => {
                                if (!h.nodes.some(n => n.nodeId == id)) {
                                    allDefined = true;
                                }
                            });
                        }
                        if (allDefined) {
                            header['cssClass'] = "configuredHeader";
                            return;
                        }
                    }
                }
            }
            header['cssClass'] = "partiallyConfiguredHeader";
            return;
        } else { //graph and node are not both empty neither both not-empty, so the configuration of the header is incomplete
            header['cssClass'] = "partiallyConfiguredHeader";
            return;
        }
    }

    initSubjHeaderCssClass() {
        if (this.s2rdfModel.subjectHeader != null) {
            if (this.s2rdfModel.subjectHeader.id != null && this.s2rdfModel.subjectHeader.node.converter != null) {
                this.s2rdfModel.subjectHeader['cssClass'] = "configuredHeader";
            } else {
                this.s2rdfModel.subjectHeader['cssClass'] = "incompleteSubjectHeader";
            }
        }
    }

    editHeader(header: SimpleHeader) {
        const modalRef: NgbModalRef = this.modalService.open(HeaderEditorModal, new ModalOptions('xl'));
        modalRef.componentInstance.headerId = header.id;
		modalRef.componentInstance.s2rdfModel = this.s2rdfModel;
        modalRef.result.then(
            () => { //closed with the "ok" button, so changes performed => update header
                this.initHeaders();
            },
            () => {}
        );
    }

    editSubjectHeader() {
        const modalRef: NgbModalRef = this.modalService.open(SubjectHeaderEditorModal, new ModalOptions('xl'));
        modalRef.componentInstance.s2rdfModel = this.s2rdfModel;
        modalRef.result.then(
            () => { //closed with the "ok" button, so changes performed => update header
                this.initHeaders();
            },
            () => {}
        );
    }

    exportStatus() {
        this.s2rdfService.exportStatus().subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink({key:"SHEET2RDF.ACTIONS.EXPORT_MAPPING_STATUS"}, null, exportLink, "s2rdf_status.json");
            }
        );
    }

    loadStatus(statusFile: File) {
        this.s2rdfService.importStatus(statusFile).subscribe(
            () => {
                this.initHeaders();
            }
        )
    }

    /* ==========================================================
     * PEARL EDITOR HANDLERS
     * ========================================================== */

    pearl: string;
    pearlValidation: PearlValidationResult = { valid: true };

    private pearlValidationTimer: number;

    private resetPearlEditor() {
        this.pearl = "";
        this.pearlValidation = { valid: true, details: null };
    }

    onPearlChange() {
        //reset the previous timeout and set it again
        clearTimeout(this.pearlValidationTimer);
        this.pearlValidationTimer = window.setTimeout(() => { this.checkPearl() }, 1000);
    }

    generatePearl() {
        this.s2rdfService.getPearl().subscribe(
            pearl => {
                this.pearl = pearl;
                this.checkPearl();
                this.triplesPreview = null;
            }
        );
    }

    loadPearl(pearlFile: File) {
        this.s2rdfService.uploadPearl(pearlFile).subscribe(
            pearl => {
                this.pearl = pearl;
            }
        )
    }

    private checkPearl() {
        if (this.pearl == undefined) {
            this.pearlValidation = { valid: true };
            return;
        };
        this.codaService.validatePearl(this.pearl).subscribe(
            valid => {
                this.pearlValidation = valid;
            }
        );
    }

    exportPearl() {
        var data = new Blob([this.pearl], { type: 'text/plain' });
        var textFile = window.URL.createObjectURL(data);
        var fileName = "pearl_export.pr";
        this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_PEARL" }, null, textFile, fileName).then(
            (done: any) => { window.URL.revokeObjectURL(textFile); },
            () => { }
        );
    }

    insertConverter() {
        this.sharedModals.selectConverter({key:"ACTIONS.PICK_CONVERTER"}, null).then(
            (converter: {projectionOperator: string, contractDesctiption: any }) => {
                this.viewChildCodemirror.insertAtCursor(converter.projectionOperator);
            },
            () => {}
        )
    }

    /* ==========================================================
     * GENERATED TRIPLES HANDLERS
     * ========================================================== */

    truncatedTriples: number;
    totalTriples: number;
    triplesPreview: TriplePreview[];
    alternateRowHelper: {[key: number]: number}; //support for alternating the style of the triples in the preview
    private selectedTriplePreviewRow: TriplePreview;

    exportFormats: RDFFormat[];

    private resetTriplePreview() {
        this.totalTriples = 0;
        this.truncatedTriples = 0;
        this.triplesPreview = null;
        this.selectedTriplePreviewRow = null;
    }

    generateTriples() {
        if (this.pearlValidation != null && !this.pearlValidation.valid) {
            this.basicModals.alert({key:"STATUS.ERROR"}, {key:"MESSAGES.PEARL_CODE_WITH_ERROR"}, ModalType.warning);
            return;
        } else {
            this.invokeGetTriplesPreview();
        }
    }

    private invokeGetTriplesPreview() {
        this.s2rdfService.savePearl(this.pearl).subscribe(
            stResp => {
                this.resetTriplePreview();
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.s2rdfService.getTriplesPreview(this.maxSizePreviews).subscribe(
                    triplesPreview => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.totalTriples = triplesPreview.total;
                        this.truncatedTriples = triplesPreview.returned;
                        this.triplesPreview = triplesPreview.triples;

                        let rows: number[] = this.triplesPreview.map(t => t.row).filter((item, pos, self) => self.indexOf(item) == pos);
                        this.alternateRowHelper = {};
                        rows.forEach((r, idx) => {
                            this.alternateRowHelper[r] = idx;
                        })
                    }
                );
            }
        );
    }

    private selectTriplePreviewRow(row: TriplePreview) {
        this.selectedTablePreviewRow = null;
        if (this.selectedTriplePreviewRow == row) {
            this.selectedTriplePreviewRow = null;
        } else {
            this.selectedTriplePreviewRow = row;
            //select the row in the table preview that has generated the triple selected
            for (var i = 0; i < this.tablePreview.length; i++) {
                if (this.tablePreview[i].idx == this.selectedTriplePreviewRow.row) {
                    this.selectedTablePreviewRow = this.tablePreview[i];
                    document.getElementById('tableRow'+this.selectedTablePreviewRow.idx).scrollIntoView({block: 'end', behavior: 'smooth'});
                }
            }
        }
    }

    addTriples() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.s2rdfService.addTriples().subscribe(
            resp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.GENERATED_TRIPLES_ADDED"});
            }
        )

    }

    private exportTriplesAs(format: RDFFormat) {
        this.s2rdfService.exportTriples(format).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_TRIPLES"}, null, exportLink, "triples." + format.defaultFileExtension);
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


    //Draggable slider handler
    /**
     * There are two panel divisions:
     * - left/right (preview/pearl)
     * - top/bottom (preview+pearl/triples)
     * The flex values are initially the same, so all the panel are equally distributed
     *
     * When resizing horizontally, it is changed just "pearlPanelFlex" between "minPanelSize" and "maxPanelSize"
     * When resizing vertically, it is changed just "triplesPanelFlex" between "minPanelSize" and "maxPanelSize"
     * The other panel flex doesn't change.
     */

    private readonly maxPanelSize: number = 16;
    private readonly minPanelSize: number = 1;
    private readonly initialPanelSize: number = 4;

    //slider X (left/right)
    readonly previewPanelFlex: number = this.initialPanelSize;
    pearlPanelFlex: number = this.initialPanelSize;

    //slider Y (top/bottom)
    readonly topPanelFlex: number = this.initialPanelSize;
    triplesPanelFlex: number = this.initialPanelSize;

    private dragging: boolean = false;
    private startMousedownX: number; //keeps track of the X coord when starting to drag the horizontal slider
    private startMousedownY: number; //keeps track of the X coord when starting to drag the vertical slider

    onMousedownX(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedownX = event.clientX;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    onMousedownY(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedownY = event.clientY;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    onMouseup() {
        if (this.dragging) { //remove listener on mousemove
            this.onMousemove = (event: MouseEvent) => {};
            this.dragging = false;
            this.startMousedownX = null;
            this.startMousedownY = null;
        }
    }
    private onMousemove(event: MouseEvent) {}
    private draggingHandler(event: MouseEvent) {
        if (this.startMousedownX != null) { //moving along X axis
            let endMousedownX = event.clientX;
            let diffX: number = this.startMousedownX - endMousedownX;
            let pearlPanelWidth: number = this.pearlPanelRef.nativeElement.offsetWidth;
            let previewPanelWidth: number = this.previewPanelRef.nativeElement.offsetWidth;

            this.pearlPanelFlex = (pearlPanelWidth+diffX)/(previewPanelWidth-diffX)*this.previewPanelFlex;
            if (this.pearlPanelFlex > this.maxPanelSize) this.pearlPanelFlex = this.maxPanelSize;
            else if (this.pearlPanelFlex < this.minPanelSize) this.pearlPanelFlex = this.minPanelSize;
            //update the initial X position of the cursor
            this.startMousedownX = event.clientX;
        } else { //moving along Y axis
            let endMousedownY = event.clientY;
            let diffY: number = this.startMousedownY - endMousedownY;
            let topPanelHeight: number = this.topPanelRef.nativeElement.offsetHeight;
            let triplesPanelHeight: number = this.triplesPanelRef.nativeElement.offsetHeight;

            this.triplesPanelFlex = (triplesPanelHeight+diffY)/(topPanelHeight-diffY)*this.topPanelFlex;
            if (this.triplesPanelFlex > this.maxPanelSize) this.triplesPanelFlex = this.maxPanelSize;
            else if (this.triplesPanelFlex < this.minPanelSize) this.triplesPanelFlex = this.minPanelSize;
            //update the initial Y position of the cursor
            this.startMousedownY = event.clientY;
        }
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