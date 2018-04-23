import { Component, ViewChild, ElementRef, HostListener } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { HeaderEditorModal, HeaderEditorModalData } from "./headerEditorModal";
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { ExportServices } from "../services/exportServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { CodemirrorComponent } from "../widget/codemirror/codemirrorComponent";
import { ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { HeaderStruct, TableRow, TableCell, TriplePreview } from "../models/Sheet2RDF";
import { RDFFormat } from "../models/RDFFormat";
import { SKOS } from "../models/Vocabulary";
import { HttpServiceContext } from "../utils/HttpManager";
import { VBProperties } from "../utils/VBProperties";
import { VBContext } from "../utils/VBContext";
import { UIUtils } from "../utils/UIUtils";


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
        .propertyHeader { color: green; font-weight: bold; }
        .subjectHeader { color: blue; font-weight: bold; }
        .unknownHeader { color: red; font-weight: bold; }
    `]
})
export class Sheet2RdfComponent {

    @ViewChild('previewPanel',  { read: ElementRef }) private previewPanelRef: ElementRef;
    @ViewChild('pearlPanel',  { read: ElementRef }) private pearlPanelRef: ElementRef;
    
    @ViewChild('topPanel',  { read: ElementRef }) private topPanelRef: ElementRef;
    @ViewChild('triplesPanel',  { read: ElementRef }) private triplesPanelRef: ElementRef;

    @ViewChild(CodemirrorComponent) viewChildCodemirror: CodemirrorComponent;

    constructor(private s2rdfService: Sheet2RDFServices, private exportService: ExportServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) {}

    ngOnInit() {
        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.exportFormats = formats;
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
    private headers: HeaderStruct[];
    private tablePreview: TableRow[];
    private selectedTablePreviewRow: TableRow;

    private loadSpreadsheet() {
        HttpServiceContext.initSessionToken();
        this.s2rdfService.uploadSpreadsheet(this.spreadsheetFile).subscribe(
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
        this.pearlUnsaved = false;
        this.pearlValidation = { valid: true, details: null };
        //for triples preview
        this.truncatedTriples = null;
        this.totalTriples = null;
        this.triplesPreview = null;
        this.selectedTriplePreviewRow = null;
    }

    private initHeaders() {
        this.s2rdfService.getHeaders().subscribe(
            (headers: HeaderStruct[]) => {
                this.headers = headers;
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
    }

    private getHeaderCssClass(header: HeaderStruct) {
        let cssClass: string = "unknownHeader";
        if (header.resource) {
            if (header.resource.getRole() == RDFResourceRolesEnum.cls) {
                cssClass = "subjectHeader"; 
            } else if (header.resource.getRole() == RDFResourceRolesEnum.property) {
                cssClass = "propertyHeader";
            }
        }
        return cssClass;
    }

    private editHeader(header: HeaderStruct, first: boolean) {
        var modalData = new HeaderEditorModalData(header.id, first);
        const builder = new BSModalContextBuilder<HeaderEditorModalData>(
            modalData, undefined, HeaderEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(HeaderEditorModal, overlayConfig).result.then(
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
    private pearlUnsaved: boolean = false;
    private pearlValidation: {valid: boolean, details: string} = { valid: true, details: null };

    private pearlValidationTimer: number;

    private onPearlChange(pearl: string) {
        this.pearl = pearl;
        setTimeout(() => this.pearlUnsaved = true);

        //reset the previous timeout and set it again
        clearTimeout(this.pearlValidationTimer);
        this.pearlValidationTimer = window.setTimeout(() => { this.checkPearl() }, 1000);
    }

    private generatePearl() {
        //currently consider just one scheme (the first if there are multiple scheme active)
        let activeScheme: ARTURIResource;
        if (VBContext.getWorkingProject().getModelType() == SKOS.uri) {
            let schemes: ARTURIResource[] = this.vbProp.getActiveSchemes();
            if (schemes.length > 0) {
                activeScheme = schemes[0];
            }
        }
        this.s2rdfService.getPearl(activeScheme).subscribe(
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

    private savePearl() {
        this.s2rdfService.savePearl(this.pearl).subscribe(
            stResp => {
                this.pearlUnsaved = false;
                this.checkPearl();
            }
        );
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
            }
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
            // //this new setTimeout is required because codemirror component will fire immediately a "codechange" event.
            // //so onPearlChange() that listens the event set pearlUnsaved to true.
            // setTimeout(() => { this.pearlUnsaved = false; });
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
        if (this.pearlUnsaved) {
            this.basicModals.confirm("Unsaved pearl code", "Unsaved changes to pearl code. Are you sure to continue?", "warning").then(
                (confirm: boolean) => {
                    this.invokeGetTriplesPreview();
                },
                () => { return } //if user doesn't confirm, do not generate triples
            );
        } else if (this.pearlValidation != null && !this.pearlValidation.valid) {
            this.basicModals.alert("Invalid pearl code", "Pearl code contains error.", "warning");
            return;
        } else {
            this.invokeGetTriplesPreview();
        }
    }

    private invokeGetTriplesPreview() {
        this.s2rdfService.getTriplesPreview(this.maxSizePreviews).subscribe(
            triplesPreview => {
                this.totalTriples = triplesPreview.total;
                this.truncatedTriples = triplesPreview.returned;
                this.triplesPreview = triplesPreview.triples;
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