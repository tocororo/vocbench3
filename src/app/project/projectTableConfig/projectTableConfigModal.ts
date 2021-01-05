import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectColumnId, ProjectTableColumnStruct, ProjectUtils, ProjectViewMode } from "../../models/Project";
import { Cookie } from "../../utils/Cookie";

@Component({
    selector: "proj-table-conf-modal",
    templateUrl: "./projectTableConfigModal.html",
})
export class ProjectTableConfigModal {

    visualizationModes: { translationKey: string, mode: ProjectViewMode }[] = [
        { translationKey: "MODELS.PROJECT.PROJECTS", mode: ProjectViewMode.list }, 
        { translationKey: "PROJECTS.CONFIG.DIRECTORIES", mode: ProjectViewMode.dir }
    ];
    selectedVisualizationMode: { translationKey: string, mode: ProjectViewMode };

    columns: ProjectTableColumnStruct[] = [];
    selectedColumn: ProjectTableColumnStruct;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        //init visualization mode
        let mode: ProjectViewMode = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE) == ProjectViewMode.dir ? ProjectViewMode.dir : ProjectViewMode.list;
        this.selectedVisualizationMode = this.visualizationModes.find(m => m.mode == mode);

        this.initColumnTable();
    }

    private initColumnTable() {
        this.columns = ProjectUtils.getDefaultProjectTableColumns();
        let customOrder: ProjectColumnId[] = this.getCustomColumnsSetting(); //this setting contains the (ordered) comma separated IDs of the columns to show
        
        //update the show
        this.columns.forEach(defCol => {
            if (customOrder.indexOf(defCol.id) == -1) { //the column is not present in the custom order (hidden)
                defCol.show = false;
            }
        });

        //sort the columns according the custom order
        this.columns.sort((c1, c2) => {
            let idx1 = customOrder.indexOf(c1.id);
            if (idx1 == -1) idx1 = 99;
            let idx2 = customOrder.indexOf(c2.id);
            if (idx2 == -1) idx2 = 99;
            if (idx1 > idx2) return 1;
            else if (idx1 < idx2) return -1;
            else return 0;
        });
    }

    private getCustomColumnsSetting(): ProjectColumnId[] {
        let columnOrder: ProjectColumnId[] = ProjectUtils.defaultTableOrder;
        let colOrderCookie = Cookie.getCookie(Cookie.PROJECT_TABLE_ORDER); //this cookie contains the (ordered) comma separated IDs of the columns to show
        if (colOrderCookie != null) {
            columnOrder = <ProjectColumnId[]>colOrderCookie.split(",");
        }
        return columnOrder;
    }

    selectColumn(col: ProjectTableColumnStruct) {
        if (this.selectedColumn == col) {
            this.selectedColumn = null;
        } else {
            this.selectedColumn = col;
        }
    }

    moveUp() {
        var idx = this.columns.indexOf(this.selectedColumn);
        this.columns.splice(idx-1, 0, this.columns.splice(idx, 1)[0]);
    }

    moveDown() {
        var idx = this.columns.indexOf(this.selectedColumn);
        this.columns.splice(idx+1, 0, this.columns.splice(idx, 1)[0]);
    }

    reset() {
        Cookie.deleteCookie(Cookie.PROJECT_TABLE_ORDER);
        this.initColumnTable();
    }

    ok() {
        let oldModeCookie = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        let newModeCookie = this.selectedVisualizationMode.mode;

        let oldColumnsCookie = Cookie.getCookie(Cookie.PROJECT_TABLE_ORDER);
        let newColumnCookie = this.columns.filter(c => c.show).map(c => c.id).join(",");

        if (oldModeCookie != newModeCookie || oldColumnsCookie != newColumnCookie) { //update the cookies only if changed
            Cookie.setCookie(Cookie.PROJECT_TABLE_ORDER, newColumnCookie);
            Cookie.setCookie(Cookie.PROJECT_VIEW_MODE, newModeCookie);
            this.activeModal.close();
        } else { //if nothing changed, simply dismiss the modal
            this.activeModal.dismiss();
        }
    }

}