import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { DynamicSettingProp, SettingsProp, STProperties } from "src/app/models/Plugins";
import { ProjectServices } from "src/app/services/projectServices";
import { VBContext } from "src/app/utils/VBContext";
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

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectServices, private translateService: TranslateService) { }

    ngOnInit() {
        this.isAdmin = VBContext.getLoggedUser().isAdmin();
        //init visualization mode
        let projViewModeCookie: string = Cookie.getCookie(Cookie.PROJECT_VIEW_MODE);
        this.selectedVisualizationMode = this.visualizationModes.find(m => m.mode == projViewModeCookie);
        if (this.selectedVisualizationMode == null) {
            this.selectedVisualizationMode = this.visualizationModes[0];
        }
        this.selectedFacet = Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);

        this.initColumnTable();
        this.initFacets();
    }

    private initFacets() {
        this.projectService.getFacetsAndValue().subscribe(
            facetsAndValues => {
                Object.keys(facetsAndValues).forEach(facetName => {
                    this.facets.push({ name: facetName, displayName: facetName }); //temporarly set displayName the same facet name
                });
                //compute the display name:
                //- translate the built-in project facets (e.g. lex model, history, ...)
                this.facets.forEach(f => {
                    let translationStruct = ProjectUtils.projectFacetsTranslationStruct.find(fts => fts.facet == f.name);
                    if (translationStruct != null) {
                        f.displayName = this.translateService.instant(translationStruct.translationKey);
                    }
                });
                //- get the display name of other facets
                this.projectService.getProjectFacetsForm().subscribe(
                    facetsForm => {
                        let displayName: string;
                        this.facets.forEach(f => {
                            //search between factory provided facets
                            let prop = facetsForm.getProperty(f.name);
                            if (prop != null) {
                                displayName = prop.displayName;
                            }
                            //if facet not found among the factory provided search among the custom ones
                            if (displayName == null) {
                                let customFacets: STProperties  = facetsForm.getProperty("customFacets");
                                let customFacetsProps: STProperties[] = customFacets.type.schema.properties;
                                for (let cf of customFacetsProps) {
                                    if (cf.name == f.name) {
                                        displayName = cf.displayName;
                                    }
                                }
                            }
                            if (displayName != null) {
                                f.displayName = displayName;
                            }
                        });
                        
                        //sort facets according display name
                        this.facets.sort((f1, f2) => f1.displayName.localeCompare(f2.displayName));

                        //check if the selected facet exists
                        if (!this.facets.some(f => f.name == this.selectedFacet)) { //no facet with the stored facet cookie => select the first one
                            this.selectedFacet = this.facets[0].name;
                        }
                    }
                );
            }
        )
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
        Cookie.setCookie(Cookie.PROJECT_VIEW_MODE, newModeCookie);

        let oldFacetCookie = Cookie.getCookie(Cookie.PROJECT_FACET_BAG_OF);
        let newFacetCookie = this.selectedFacet;
        Cookie.setCookie(Cookie.PROJECT_FACET_BAG_OF, newFacetCookie);

        let oldColumnsCookie = Cookie.getCookie(Cookie.PROJECT_TABLE_ORDER);
        let newColumnCookie = this.columns.filter(c => c.show).map(c => c.id).join(",");
        Cookie.setCookie(Cookie.PROJECT_TABLE_ORDER, newColumnCookie);

        if (oldModeCookie != newModeCookie || oldFacetCookie != newFacetCookie || oldColumnsCookie != newColumnCookie) { //close if something changed
            this.activeModal.close();
        } else { //if nothing changed, simply dismiss the modal
            this.activeModal.dismiss();
        }
    }

}