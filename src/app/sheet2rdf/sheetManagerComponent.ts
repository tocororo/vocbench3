import { Component, ElementRef, HostBinding, Input, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as FileSaver from 'file-saver';
import { Observable, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { PearlValidationResult } from "../models/Coda";
import { RDFFormat } from "../models/RDFFormat";
import { AdvancedGraphApplication, GraphApplication, S2RDFModel, SimpleGraphApplication, SimpleHeader, TableRow, TriplePreview } from "../models/Sheet2RDF";
import { CODAServices } from "../services/codaServices";
import { Sheet2RDFServices } from "../services/sheet2rdfServices";
import { UIUtils } from "../utils/UIUtils";
import { VBContext } from '../utils/VBContext';
import { PearlEditorComponent } from "../widget/codemirror/pearlEditor/pearlEditorComponent";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType } from '../widget/modal/Modals';
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";
import { HeaderEditorModal } from "./s2rdfModals/headerEditorModal";
import { SubjectHeaderEditorModal } from "./s2rdfModals/subjectHeaderEditorModal";
import { Sheet2RdfContextService } from "./sheet2rdfContext";

@Component({
    selector: "sheet-manager",
    templateUrl: "./sheetManagerComponent.html",
    host: { class: "vbox" },
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
export class SheetManagerComponent {

    @Input() sheetName: string; //sheet name
    @Input() hidden: boolean;

    /**
     * Due to a known issue with ngx-codemirror (https://github.com/scttcper/ngx-codemirror/issues/12)
     * or more in general with codemirror (https://github.com/codemirror/CodeMirror/issues/5985 https://github.com/codemirror/CodeMirror/issues/61)
     * I had to adopt this solution (see the logic in ngOnChanges): 
     * - input hidden == true => host display style is set to "none"
     * - input hidden == false => host display style is set to "flex"
     * So that the current component is shown/hidden according hidden value.
     * Moreover hidden is used with *ngIf to show/hide the codemirror editor.
     */
    @HostBinding("style.display") display: string = "flex";

    @ViewChild(PearlEditorComponent) viewChildCodemirror: PearlEditorComponent;
    @ViewChild('blockingDiv', { static: true }) private blockingDivElement: ElementRef;

    //== spreadsheet ==
    spreadsheetFile: File;

    truncatedRows: number;
    totalRows: number;
    s2rdfModel: S2RDFModel;
    tablePreview: TableRow[];
    private selectedTablePreviewRow: TableRow;


    //== pearl editor ==
    pearl: string;
    pearlValidation: PearlValidationResult = { valid: true };

    private pearlValidationTimer: number;


    //== triples preview ==
    truncatedTriples: number;
    totalTriples: number;
    triplesPreview: TriplePreview[];
    alternateRowHelper: { [key: number]: number }; //support for alternating the style of the triples in the preview
    private selectedTriplePreviewRow: TriplePreview;

    exportFormats: RDFFormat[];


    constructor(private s2rdfService: Sheet2RDFServices, private s2rdfCtx: Sheet2RdfContextService, private codaService: CODAServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.exportFormats = this.s2rdfCtx.exportFormats;

        this.s2rdfModel = new S2RDFModel();
        if (this.sheetName != null) {
            this.s2rdfCtx.sheetModelMap.set(this.sheetName, this.s2rdfModel);
            this.initHeaders();
            this.initTablePreview();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['hidden']) {
            this.display = this.hidden ? "none" : "flex";
        }
    }

    /* ==========================================================
     * SPREADSHEET HANDLERS
     * ========================================================== */

    private initHeaders() {
        this.s2rdfService.getSheetHeaders(this.sheetName).subscribe(
            (headers: S2RDFModel) => {
                this.s2rdfModel.subjectHeader = headers.subjectHeader;
                this.s2rdfModel.headers = headers.headers;

                //init CSS classes of headers
                this.initSubjHeaderCssClass();
                this.s2rdfModel.headers.forEach(h => this.initHeaderCssClass(h));

                this.updateMemoizeIdList();
            }
        );
    }

    /**
     * update the memoization ID list by adding the map IDs from the node of the subject and the nodes of the headers
     */
    private updateMemoizeIdList() {
        //from subject header
        if (this.s2rdfModel.subjectHeader.node.memoize && this.s2rdfModel.subjectHeader.node.memoizeId != null && !this.s2rdfCtx.memoizeIdList.includes(this.s2rdfModel.subjectHeader.node.memoizeId)) {
            this.s2rdfCtx.memoizeIdList.push(this.s2rdfModel.subjectHeader.node.memoizeId);
        }
        //from other headers
        this.s2rdfModel.headers.forEach(h => {
            h.nodes.forEach(n => {
                if (n.memoize && n.memoizeId != null && !this.s2rdfCtx.memoizeIdList.includes(n.memoizeId)) {
                    this.s2rdfCtx.memoizeIdList.push(n.memoizeId);
                }
            });
        });
    }

    private initTablePreview() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        let maxRows = VBContext.getWorkingProjectCtx().getProjectPreferences().sheet2RdfSettings.maxRowsTablePreview;
        this.s2rdfService.getTablePreview(this.sheetName, maxRows).subscribe(
            table => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.truncatedRows = table.returned;
                this.totalRows = table.total;
                this.tablePreview = table.rows;
            }
        );
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
        modalRef.componentInstance.sheetName = this.sheetName;
        modalRef.componentInstance.headerId = header.id;
        modalRef.result.then(
            () => { //closed with the "ok" button, so changes performed => update header
                this.initHeaders();
            },
            () => { }
        );
    }

    editSubjectHeader() {
        const modalRef: NgbModalRef = this.modalService.open(SubjectHeaderEditorModal, new ModalOptions('xl'));
        modalRef.componentInstance.sheetName = this.sheetName;
        modalRef.result.then(
            () => { //closed with the "ok" button, so changes performed => update header
                this.initHeaders();
            },
            () => { }
        );
    }

    exportStatus() {
        this.s2rdfService.exportSheetStatus(this.sheetName).subscribe(
            blob => {
                FileSaver.saveAs(blob, this.sheetName + " - status.json");
            }
        );
    }

    loadStatus(statusFile: File) {
        this.s2rdfService.importSheetStatus(this.sheetName, statusFile).subscribe(
            () => {
                this.initHeaders();
            }
        );
    }

    /* ==========================================================
     * PEARL EDITOR HANDLERS
     * ========================================================== */

    onPearlChange() {
        //reset the previous timeout and set it again
        clearTimeout(this.pearlValidationTimer);
        this.pearlValidationTimer = window.setTimeout(() => { this.checkPearl(); }, 1000);
    }

    generatePearl() {
        this.s2rdfService.getPearl(this.sheetName).subscribe(
            pearl => {
                this.pearl = pearl;
                this.checkPearl();
                this.triplesPreview = null;
            }
        );
    }

    loadPearl(pearlFile: File) {
        this.s2rdfService.uploadPearl(this.sheetName, pearlFile).subscribe(
            pearl => {
                this.pearl = pearl;
            }
        );
    }

    private checkPearl() {
        if (this.pearl == undefined) {
            this.pearlValidation = { valid: true };
            return;
        }
        this.codaService.validatePearl(this.pearl).subscribe(
            valid => {
                this.pearlValidation = valid;
            }
        );
    }

    exportPearl() {
        let data = new Blob([this.pearl], { type: 'text/plain' });
        FileSaver.saveAs(data, "pearl_export.pr");
    }

    insertConverter() {
        this.sharedModals.selectConverter({ key: "ACTIONS.PICK_CONVERTER" }, null).then(
            (converter: { projectionOperator: string, contractDesctiption: any }) => {
                this.viewChildCodemirror.insertAtCursor(converter.projectionOperator);
            },
            () => { }
        );
    }

    /* ==========================================================
     * GENERATED TRIPLES HANDLERS
     * ========================================================== */

    private resetTriplePreview() {
        this.totalTriples = 0;
        this.truncatedTriples = 0;
        this.triplesPreview = null;
        this.selectedTriplePreviewRow = null;
    }

    generateTriples(): Observable<void> {
        if (this.pearlValidation != null && !this.pearlValidation.valid) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.PEARL_CODE_WITH_ERROR" }, ModalType.warning);
            return of(null);
        } else {
            return this.invokeGetTriplesPreview();
        }
    }

    private invokeGetTriplesPreview(): Observable<void> {
        return this.s2rdfService.savePearl(this.sheetName, this.pearl).pipe(
            mergeMap(() => {
                this.resetTriplePreview();
                UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
                let maxRows = VBContext.getWorkingProjectCtx().getProjectPreferences().sheet2RdfSettings.maxRowsTablePreview;
                return this.s2rdfService.getTriplesPreview(this.sheetName, maxRows).pipe(
                    map(triplesPreview => {
                        UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                        this.totalTriples = triplesPreview.total;
                        this.truncatedTriples = triplesPreview.returned;
                        this.triplesPreview = triplesPreview.triples;

                        let rows: number[] = this.triplesPreview.map(t => t.row).filter((item, pos, self) => self.indexOf(item) == pos);
                        this.alternateRowHelper = {};
                        rows.forEach((r, idx) => {
                            this.alternateRowHelper[r] = idx;
                        });
                    })
                );
            })
        );
    }

    selectTriplePreviewRow(row: TriplePreview) {
        this.selectedTablePreviewRow = null;
        if (this.selectedTriplePreviewRow == row) {
            this.selectedTriplePreviewRow = null;
        } else {
            this.selectedTriplePreviewRow = row;
            //select the row in the table preview that has generated the triple selected
            for (let i = 0; i < this.tablePreview.length; i++) {
                if (this.tablePreview[i].idx == this.selectedTriplePreviewRow.row) {
                    this.selectedTablePreviewRow = this.tablePreview[i];
                    document.getElementById('tableRow' + this.selectedTablePreviewRow.idx).scrollIntoView({ block: 'end', behavior: 'smooth' });
                }
            }
        }
    }

    addTriples(alertOnComplete: boolean = true): Observable<void> {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        return this.s2rdfService.addTriples(this.sheetName).pipe(
            map(() => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                if (alertOnComplete) {
                    this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.GENERATED_TRIPLES_ADDED" });
                }
            })
        );

    }

    exportTriplesAs(format: RDFFormat) {
        this.s2rdfService.exportTriples(this.sheetName, format).subscribe(
            blob => {
                FileSaver.saveAs(blob, "triples." + format.defaultFileExtension);
            }
        );
    }


}
