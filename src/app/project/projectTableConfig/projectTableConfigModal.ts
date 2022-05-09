import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { STProperties } from "src/app/models/Plugins";
import { ProjectServices } from "src/app/services/projectServices";
import { VBContext } from "src/app/utils/VBContext";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ProjectColumnId, ProjectTableColumnStruct, ProjectUtils, ProjectViewMode } from "../../models/Project";
import { Cookie } from "../../utils/Cookie";

@Component({
    selector: "proj-table-conf-modal",
    templateUrl: "./projectTableConfigModal.html",
})
export class ProjectTableConfigModal {

    isAdmin: boolean;

    visualizationModes: { translationKey: string, mode: ProjectViewMode }[] = [
        { translationKey: "PROJECTS.CONFIG.LIST", mode: ProjectViewMode.list }, 
        { translationKey: "PROJECTS.CONFIG.FACET_BASED", mode: ProjectViewMode.facet }
    ];
    selectedVisualizationMode: { translationKey: string, mode: ProjectViewMode };

    facets: { name: string, displayName: string }[] = [];
    selectedFacet: string; //name of the facet

    columns: ProjectTableColumnStruct[] = [];
    selectedColumn: ProjectTableColumnStruct;

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices, private basicModals: BasicModalServices, private translateService: TranslateService) { }

    ngOnInit() {
        this.isAdmin = VBContext.getLoggedUser().isAdmin();
        //init visualization mode
        let projViewModeCookie: string = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        this.selectedVisualizationMode = this.visualizationModes.find(m => m.mode == projViewModeCookie);
        if (this.selectedVisualizationMode == null) {
            this.selectedVisualizationMode = this.visualizationModes[0];
        }
        
        if (this.isAdmin) {
            this.initColumnTable();
        }
        this.initFacets();
    }

    private initFacets() {
        //- collect the custom facets
        this.projectService.getProjectFacetsForm().subscribe(
            facetsForm => {
                facetsForm.properties.forEach(p => {
                    if (p.name == "customFacets") {
                        let customFacetsProps: STProperties[] = p.type.schema.properties;
                        customFacetsProps.forEach(cf => {
                            this.facets.push({ name: cf.name, displayName: cf.displayName });
                        });
                    } else {
                        this.facets.push({ name: p.name, displayName: p.displayName });
                    }
                });
                //now the built-in (e.g. lex model, history, ...)
                this.projectService.getFacetsAndValue().subscribe(
                    facetsAndValues => {
                        Object.keys(facetsAndValues).forEach(facetName => {
                            //check if the facets is not yet added (getFacetsAndValue returns all the facets which have at least a value in the projects)
                            if (!this.facets.some(f => f.name == facetName)) {
                                //retrieve and translate the display name
                                let displayName = facetName; //as fallback the displayName is the same facet name
                                let translationStruct = ProjectUtils.projectFacetsTranslationStruct.find(fts => fts.facet == facetName);
                                if (translationStruct != null) {
                                    displayName = this.translateService.instant(translationStruct.translationKey);
                                }
                                this.facets.push({ name: facetName, displayName: displayName });
                            }
                        });

                        this.facets.sort((f1, f2) => f1.displayName.localeCompare(f2.displayName));

                        //init selected facet (for facet-based visualization) with the stored cookie, or if none (or not valid) with the first facet available
                        let selectedFacetCookie: string = Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);
                        if (selectedFacetCookie != null && this.facets.some(f => f.name == selectedFacetCookie)) {
                            this.selectedFacet = selectedFacetCookie;
                        } else {
                            this.selectedFacet = this.facets[0].name;
                        }
                    }
                );
            }
        );
    }

    recreateFacetsIndex() {
        this.projectService.createFacetIndex().subscribe(
            () => {
                this.basicModals.alert({key: "STATUS.OPERATION_DONE"}, {key: "MESSAGES.FACETS_INDEX_RECREATED"});
            }
        );
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
        let idx = this.columns.indexOf(this.selectedColumn);
        this.columns.splice(idx-1, 0, this.columns.splice(idx, 1)[0]);
    }

    moveDown() {
        let idx = this.columns.indexOf(this.selectedColumn);
        this.columns.splice(idx+1, 0, this.columns.splice(idx, 1)[0]);
    }

    reset() {
        Cookie.deleteCookie(Cookie.PROJECT_TABLE_ORDER);
        this.initColumnTable();
    }

    ok() {
        let oldModeCookie = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        let newModeCookie = this.selectedVisualizationMode.mode;
        if (oldModeCookie != newModeCookie) {
            Cookie.setCookie(Cookie.PROJECT_VIEW_MODE, newModeCookie);
        }
        
        let oldFacetCookie = Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);
        let newFacetCookie = this.selectedFacet;
        if (oldFacetCookie != newFacetCookie) {
            Cookie.setCookie(Cookie.PROJECT_FACET_BAG_OF, newFacetCookie);
        }
        
        let oldColumnsCookie = Cookie.getCookie(Cookie.PROJECT_TABLE_ORDER);
        let newColumnCookie = this.columns.filter(c => c.show).map(c => c.id).join(",");
        if (this.isAdmin && oldColumnsCookie != newColumnCookie) {
            Cookie.setCookie(Cookie.PROJECT_TABLE_ORDER, newColumnCookie);
        }
        
        if (oldModeCookie != newModeCookie || oldFacetCookie != newFacetCookie || oldColumnsCookie != newColumnCookie) { //close if something changed
            this.activeModal.close();
        } else { //if nothing changed, simply dismiss the modal
            this.activeModal.dismiss();
        }
    }

}