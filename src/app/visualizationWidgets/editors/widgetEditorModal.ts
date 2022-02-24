import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { timingSafeEqual } from "crypto";
import { Reference } from "src/app/models/Configuration";
import { Scope, ScopeUtils } from "src/app/models/Plugins";
import { QueryChangedEvent } from "src/app/models/Sparql";
import { DataTypeBindingsMap, WidgetCategory, WidgetDataBinding, WidgetDataType, WidgetDefinition, WidgetStruct, WidgetUtils } from "src/app/models/VisualizationWidgets";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalType } from "src/app/widget/modal/Modals";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "widget-editor-modal",
    templateUrl: "./widgetEditorModal.html",
})
export class WidgetEditorModal {
    @Input() title: string;
    @Input() existingWidgets: WidgetStruct[];
    @Input() ref: string;
    @Input() readOnly: boolean;

    name: string;

    widgetTypes: { id: WidgetCategory, translationKey: string }[] = [
        { id: WidgetCategory.chart, translationKey: "Chart" },
        { id: WidgetCategory.map, translationKey: "Map" }
    ];
    selectedWidgetCategory: WidgetCategory;

    mapTypes: { id: WidgetDataType, translationKey: string }[] = [
        { id: WidgetDataType.point, translationKey: "Point" },
        { id: WidgetDataType.area, translationKey: "Area" },
        { id: WidgetDataType.route, translationKey: "Route" }
    ];
    chartTypes: { id: WidgetDataType, translationKey: string }[] = [
        { id: WidgetDataType.series, translationKey: "Series" },
        { id: WidgetDataType.series_collection, translationKey: "Series collection" },
    ];
    selectedWidgetDataType: WidgetDataType;

    requiredBindings: WidgetDataBinding[];

    sparqlEditors: SparqlEditorStruct[] = [
        { type: SparqlEditorEnum.Retrieve, query: "", valid: false },
        { type: SparqlEditorEnum.Update, query: "", valid: false },
    ];
    activeSparqlEditor: SparqlEditorStruct = this.sparqlEditors[0];

    constructor(private visualizationWidgetsService: VisualizationWidgetsServices, private basicModals: BasicModalServices, private activeModal: NgbActiveModal, private elementRef: ElementRef) {
    }

    ngOnInit() {
        UIUtils.setFullSizeModal(this.elementRef);

        if (this.ref != null) { //edit
            this.visualizationWidgetsService.getWidget(this.ref).subscribe(
                patternConf => {
                    this.name = Reference.getRelativeReferenceIdentifier(this.ref);

                    this.selectedWidgetDataType = WidgetUtils.classNameDataTypeMap[patternConf.type];
                    if (this.selectedWidgetDataType == WidgetDataType.area || this.selectedWidgetDataType == WidgetDataType.point || this.selectedWidgetDataType == WidgetDataType.route) {
                        this.selectedWidgetCategory = WidgetCategory.map;
                    } else {
                        this.selectedWidgetCategory = WidgetCategory.chart;
                    }
                    this.onWidgetDataTypeChanged();
                    
                    this.sparqlEditors.find(ps => ps.type == SparqlEditorEnum.Retrieve).query = patternConf.getPropertyValue("retrieve");
                    this.sparqlEditors.find(ps => ps.type == SparqlEditorEnum.Update).query = patternConf.getPropertyValue("update");
                }
            );
        }
    }

    onWidgetCategoryChanged() {
        this.selectedWidgetDataType = null;
        this.requiredBindings = [];
    }

    onWidgetDataTypeChanged() {
        this.requiredBindings = DataTypeBindingsMap.getRequiredBindings(this.selectedWidgetDataType);
    }

    onQueryChanged(editor: SparqlEditorStruct, event: QueryChangedEvent) {
        editor.query = event.query;
        editor.valid = event.valid;
    }

    isDataValid(): boolean {
        //check if in the retrieve (and update, if any) query, there are the required bindings

        let retrieveQuery = this.sparqlEditors.find(e => e.type == SparqlEditorEnum.Retrieve).query;
        let select = retrieveQuery.substring(retrieveQuery.toLocaleLowerCase().indexOf("select"), retrieveQuery.indexOf("{"));
        let retrieveValid = this.containsRequiredBindings(select, this.requiredBindings);

        let updateValid: boolean = true;
        let udpateQuery = this.sparqlEditors.find(e => e.type == SparqlEditorEnum.Update).query;
        if (udpateQuery) {
            updateValid = this.containsRequiredBindings(udpateQuery, this.requiredBindings);
        }

        return retrieveValid && updateValid;
    }

    private containsRequiredBindings(query: string, bindings: WidgetDataBinding[]) {
        for (let b of bindings) {
            if (!query.includes("?" + b + " ")) {
                return false;
            }
        }
        return true;
    }

    isOkEnabled() {
        return this.name && this.name.trim() != "" && this.selectedWidgetDataType && this.activeSparqlEditor.valid;
    }

    ok() {
        if (this.isDataValid()) {
            let widgetDef: WidgetDefinition = {
                retrieve: this.sparqlEditors.find(e => e.type == SparqlEditorEnum.Retrieve).query,
                update: this.sparqlEditors.find(e => e.type == SparqlEditorEnum.Update).query
            }
            //ref is the same provided as input (in edit mode) or built according the name entered by user (in create mode)
            let refParam = this.ref ? this.ref : ScopeUtils.serializeScope(Scope.PROJECT) + ":" + this.name; //store pattern at project level
            this.visualizationWidgetsService.createWidget(refParam, widgetDef, this.selectedWidgetDataType).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        } else {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "Required binding missing", ModalType.warning);
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }
}


interface SparqlEditorStruct {
    type: SparqlEditorEnum;
    query: string;
    valid: boolean;
}

enum SparqlEditorEnum {
    Retrieve = "Retrieve",
    Update = "Update"
}