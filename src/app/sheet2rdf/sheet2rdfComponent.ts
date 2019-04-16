import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { Properties } from "../models/Properties";
import { RDFFormat } from "../models/RDFFormat";
import { FsNamingStrategy, GraphApplication, SimpleHeader, SubjectHeader, TableRow, TriplePreview } from "../models/Sheet2RDF";
import { ExportServices } from "../services/exportServices";
import { PreferencesSettingsServices } from "../services/preferencesSettingsServices";
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { HttpServiceContext } from "../utils/HttpManager";
import { UIUtils } from "../utils/UIUtils";
import { CodemirrorComponent } from "../widget/codemirror/codemirrorComponent";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { HeaderEditorModal, HeaderEditorModalData } from "./s2rdfModals/headerEditorModal";
import { Sheet2RdfSettingsModal, Sheet2RdfSettingsModalData } from "./s2rdfModals/sheet2rdfSettingsModal";
import { SubjectHeaderEditorModal, SubjectHeaderEditorModalData } from "./s2rdfModals/subjectHeaderEditorModal";


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
            background: #fff;
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
        .ignoredHeader { color: gray; }
        .unconfiguredHeader { color: black; }
        .incompleteHeader { color: red; }
    `]
})
export class Sheet2RdfComponent {

    @ViewChild('previewPanel',  { read: ElementRef }) private previewPanelRef: ElementRef;
    @ViewChild('pearlPanel',  { read: ElementRef }) private pearlPanelRef: ElementRef;
    
    @ViewChild('topPanel',  { read: ElementRef }) private topPanelRef: ElementRef;
    @ViewChild('triplesPanel',  { read: ElementRef }) private triplesPanelRef: ElementRef;

    @ViewChild(CodemirrorComponent) viewChildCodemirror: CodemirrorComponent;

    //preferences
    private useHeader: boolean = true;
    private fsNamingStrategy: FsNamingStrategy = FsNamingStrategy.columnNumericIndex;

    constructor(private s2rdfService: Sheet2RDFServices, private exportService: ExportServices, private prefService: PreferencesSettingsServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) {}

    ngOnInit() {

        HttpServiceContext.initSessionToken();

        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.exportFormats = formats;
            }
        );
        
        //init settings
        this.prefService.getPUSettings([Properties.pref_s2rdf_use_headers, Properties.pref_s2rdf_fs_naming_strategy]).subscribe(
            prefs => {
                let useHeaderPref: string = prefs[Properties.pref_s2rdf_use_headers];
                if (useHeaderPref != null) {
                    this.useHeader = useHeaderPref != "false";
                }
                let fsNamingStrategyPref: string = prefs[Properties.pref_s2rdf_fs_naming_strategy];
                if (fsNamingStrategyPref != null) {
                    this.fsNamingStrategy = <FsNamingStrategy>fsNamingStrategyPref;
                }
            }
        );
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

    private spreadsheetFile: File;

    private maxSizePreviews: number = 20;
    private truncatedRows: number;
    private totalRows: number;
    private headers: SimpleHeader[];
    private subjectHeader: SubjectHeader;
    private tablePreview: TableRow[];
    private selectedTablePreviewRow: TableRow;

    private loadSpreadsheet() {
        // HttpServiceContext.initSessionToken();
        this.s2rdfService.uploadSpreadsheet(this.spreadsheetFile, this.fsNamingStrategy).subscribe(
            stResp => {
                this.resetAll();
                this.initHeaders();
                this.initTablePreview();
            }
        );
    }

    private resetAll() {
        //restore initial state (in case there was a previous sheet loaded)
        //for sheet preview
        this.headers = null;
        this.tablePreview = null;
        this.truncatedRows = null;
        this.totalRows = null;
        //for pearl
        this.pearl = "";
        this.updatePearl(this.pearl);
        this.pearlValidation = { valid: true, details: null };
        //for triples preview
        this.truncatedTriples = null;
        this.totalTriples = null;
        this.triplesPreview = null;
        this.selectedTriplePreviewRow = null;
    }

    private initHeaders() {
        this.s2rdfService.getHeaders().subscribe(
            (headers: { subject: SubjectHeader, headers: SimpleHeader[] }) => {
                this.subjectHeader = headers.subject;
                this.headers = headers.headers;
            }
        );
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
    private fileChangeEvent(file: File) {
        this.spreadsheetFile = file;
        this.loadSpreadsheet();
    }

    private getHeaderCssClass(header: SimpleHeader) {
        /**
         * configuredHeader: if there is at least one graph application which its node is defined (converter assigned)
         * unconfiguredHeader: there is no node definition neither graph application for the header
         * incompleteHeader: only one between nodes and graph not defined, or graph application whith node not defined
         */
        if (header.ignore) {
            return "ignoredHeader";
        }
        if (header.graph.length == 0 && header.nodes.length == 0) {
            return "unconfiguredHeader";
        }
        if (header.graph.length > 0 && header.nodes.length > 0) {
            for (let i = 0; i < header.graph.length; i++) {
                let g: GraphApplication = header.graph[i];
                if (g.property != null) {
                    //property assigned, now check for the node
                    for (let j = 0; j < header.nodes.length; j++) {
                        if (header.nodes[j].nodeId == g.nodeId && header.nodes[j].converter != null) {
                            return "configuredHeader";
                        }
                        g.nodeId;
                    }
                }
            }
            return "incompleteHeader";
        } else { //graph and node are not both empty neither both not-empty, so the configuration of the header is incomplete
            return "incompleteHeader";
        }
    }

    private editHeader(header: SimpleHeader) {
        var modalData = new HeaderEditorModalData(header.id);
        const builder = new BSModalContextBuilder<HeaderEditorModalData>(
            modalData, undefined, HeaderEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(HeaderEditorModal, overlayConfig).result.then(
            () => { //closed with the "ok" button, so changes performed => update header
                this.initHeaders();
            },
            () => {}
        );
    }

    private editSubjectHeader() {
        var modalData = new SubjectHeaderEditorModalData(this.headers, this.subjectHeader);
        const builder = new BSModalContextBuilder<SubjectHeaderEditorModalData>(
            modalData, undefined, SubjectHeaderEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(SubjectHeaderEditorModal, overlayConfig).result.then(
            () => { //closed with the "ok" button, so changes performed => update header
                this.initHeaders();
            },
            () => {}
        );
    }

    /* ==========================================================
     * PEARL EDITOR HANDLERS
     * ========================================================== */

    private pearl: string;
    private pearlValidation: {valid: boolean, details: string} = { valid: true, details: null };

    private pearlValidationTimer: number;

    private onPearlChange(pearl: string) {
        this.pearl = pearl;
        //reset the previous timeout and set it again
        clearTimeout(this.pearlValidationTimer);
        this.pearlValidationTimer = window.setTimeout(() => { this.checkPearl() }, 1000);
    }

    private generatePearl() {
        this.s2rdfService.getPearl().subscribe(
            pearl => {
                this.updatePearl(pearl);
                this.checkPearl();
            }
        );
    }

    private loadPearl(pearlFile: File) {
        this.s2rdfService.uploadPearl(pearlFile).subscribe(
            pearl => {
                this.updatePearl(pearl);
            }
        )
    }

    private checkPearl() {
        if (this.pearl == undefined) {
            this.pearlValidation = { valid: true, details: null };
            return;
        };
        this.s2rdfService.validatePearl(this.pearl).subscribe(
            valid => {
                this.pearlValidation = valid;
            }
        );
    }

    private exportPearl() {
        var data = new Blob([this.pearl], { type: 'text/plain' });
        var textFile = window.URL.createObjectURL(data);
        var fileName = "pearl_export.pr";
        this.basicModals.downloadLink("Save SPARQL results", null, textFile, fileName).then(
            (done: any) => { window.URL.revokeObjectURL(textFile); },
            () => { }
        );
    }

    private insertConverter() {
        this.sharedModals.selectConverter("Pick a converter", null).then(
            (converter: {projectionOperator: string, contractDesctiption: any }) => {
                this.viewChildCodemirror.insertAtCursor(converter.projectionOperator);
            },
            () => {}
        )
    }

    /**
     * Due to an issue with the codemirror component (read more in ngOnChanges of CodemirrorComponent.ts)
     * the pearl update performed setting a value to this.pearl requires to be done by setting to undefined the value 
     * then, after triggering a round of change detection, setting the "actual" value.
     * @param pearl 
     */
    private updatePearl(pearl: string) {
        this.pearl = undefined;
        setTimeout(() => {
            this.pearl = pearl;
        });
    }

    /* ==========================================================
     * GENERATED TRIPLES HANDLERS
     * ========================================================== */

    private truncatedTriples: number;
    private totalTriples: number;
    private triplesPreview: TriplePreview[];
    private selectedTriplePreviewRow: TriplePreview;

    private exportFormats: RDFFormat[];

    private generateTriples() {
        if (this.pearlValidation != null && !this.pearlValidation.valid) {
            this.basicModals.alert("Invalid pearl code", "Pearl code contains errors.", "warning");
            return;
        } else {
            this.invokeGetTriplesPreview();
        }
    }

    private invokeGetTriplesPreview() {
        this.s2rdfService.savePearl(this.pearl).subscribe(
            stResp => {
                this.totalTriples = 0;
                this.truncatedTriples = 0;
                this.triplesPreview = null;
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.s2rdfService.getTriplesPreview(this.maxSizePreviews).subscribe(
                    triplesPreview => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        this.totalTriples = triplesPreview.total;
                        this.truncatedTriples = triplesPreview.returned;
                        this.triplesPreview = triplesPreview.triples;
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

    private addTriples() {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.s2rdfService.addTriples().subscribe(
            resp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.basicModals.alert("Triples added", "The generated triples have been added");
            }
        )

    }

    private exportTriplesAs(format: RDFFormat) {
        this.s2rdfService.exportTriples(format).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink("Export triples in " + format.name, null, exportLink, "triples." + format.defaultFileExtension);
            }
        )
    }

    //======================

    private settings() {
        // var modalData = new Sheet2RdfSettingsModalData(this.useHeader, this.fsNamingStrategy);
        var modalData = new Sheet2RdfSettingsModalData(this.fsNamingStrategy);
        const builder = new BSModalContextBuilder<Sheet2RdfSettingsModalData>(
            modalData, undefined, Sheet2RdfSettingsModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(Sheet2RdfSettingsModal, overlayConfig).result.then(
            // (updatedSettings: Sheet2RdfSettingsModalReturnData) => { //closed with the "ok" button, so changes performed => reload
            //     this.useHeader = updatedSettings.useHeader;
            //     this.fsNamingStrategy = updatedSettings.fsNamingStrategy;
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
    private readonly previewPanelFlex: number = this.initialPanelSize;
    private pearlPanelFlex: number = this.initialPanelSize;

    //slider Y (top/bottom)
    private readonly topPanelFlex: number = this.initialPanelSize;
    private triplesPanelFlex: number = this.initialPanelSize;

    private dragging: boolean = false;
    private startMousedownX: number; //keeps track of the X coord when starting to drag the horizontal slider
    private startMousedownY: number; //keeps track of the X coord when starting to drag the vertical slider

    private onMousedownX(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedownX = event.clientX;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    private onMousedownY(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedownY = event.clientY;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    private onMouseup() {
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