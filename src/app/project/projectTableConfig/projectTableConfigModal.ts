import { Component } from "@angular/core";
import { BSModalContext, BSModalContextBuilder, Modal } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { DialogRef, ModalComponent } from "angular2-modal";
import { ProjectTableColumnStruct } from "../../models/Project";
import { Cookie } from "../../utils/Cookie";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "proj-table-conf-modal",
    templateUrl: "./projectTableConfigModal.html",
})
export class ProjectTableConfigModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private columns: ProjectTableColumnStruct[] = [];

    private selectedColumn: ProjectTableColumnStruct;

    constructor(public dialog: DialogRef<BSModalContext>, private modal: Modal, private vbProperties: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.columns = this.vbProperties.getCustomProjectTableColumns();
        console.log("columns at init", this.columns);
    }

    private selectColumn(col: ProjectTableColumnStruct) {
        if (this.selectedColumn == col) {
            this.selectedColumn = null;
        } else {
            this.selectedColumn = col;
        }
    }

    private updateColumnShow(col: ProjectTableColumnStruct) {
        this.saveTableConfig();
    }

    private moveUp() {
        var idx = this.columns.indexOf(this.selectedColumn);
        this.columns.splice(idx-1, 0, this.columns.splice(idx, 1)[0]);
        this.saveTableConfig();
    }

    private moveDown() {
        var idx = this.columns.indexOf(this.selectedColumn);
        this.columns.splice(idx+1, 0, this.columns.splice(idx, 1)[0]);
        this.saveTableConfig();
    }

    private reset() {
        this.columns = this.vbProperties.getDefaultProjectTableColumns();
        Cookie.deleteCookie(Cookie.PROJECT_TABLE_ORDER);
    }

    private saveTableConfig() {
        Cookie.setCookie(Cookie.PROJECT_TABLE_ORDER, JSON.stringify(this.columns),  365*10);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}