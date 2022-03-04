import { KeyValue } from "@angular/common";
import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Reference } from "src/app/models/Configuration";
import { Scope, ScopeUtils } from "src/app/models/Plugins";
import { QueryChangedEvent } from "src/app/models/Sparql";
import { DataTypeBindingsMap, WidgetCategory, WidgetDataBinding, WidgetDataType, WidgetDefinition, WidgetStruct, WidgetUtils } from "src/app/models/VisualizationWidgets";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { YasguiComponent } from "src/app/sparql/yasguiComponent";
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

    @ViewChild(YasguiComponent, { static: false }) viewChildYasgui: YasguiComponent;

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

    private retrieveEditor: SparqlEditorStruct = { type: SparqlEditorEnum.Retrieve, query: "", valid: true, requiredBindings: [] };
    private updateEditor: SparqlEditorStruct = { type: SparqlEditorEnum.Update, query: "", valid: true, requiredBindings: [] };
    sparqlEditors: SparqlEditorStruct[] = [this.retrieveEditor, this.updateEditor];
    activeSparqlEditor: SparqlEditorStruct = this.retrieveEditor;

    retrieveVariableDescr: VariableDestriptionMapping;
    udpateInfo: string;

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

                    this.retrieveEditor.query = patternConf.getPropertyValue("retrieve");
                    this.updateEditor.query = patternConf.getPropertyValue("update");
                }
            );
        }
    }

    //keyvalue pipe sort keys alphabetically. I need to keep the original order (see https://stackoverflow.com/a/52794221)
    originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => { return 0; };

    onWidgetCategoryChanged() {
        this.selectedWidgetDataType = null;
    }

    onWidgetDataTypeChanged() {
        this.retrieveEditor.query = WidgetQueryUtils.retrieveQueryMap[this.selectedWidgetDataType];
        this.retrieveEditor.requiredBindings = DataTypeBindingsMap.getRequiredRetrieveBindings(this.selectedWidgetDataType);
        
        this.updateEditor.query = WidgetQueryUtils.updateQueryMap[this.selectedWidgetDataType];
        this.updateEditor.requiredBindings = DataTypeBindingsMap.getRequiredUpdateBindings(this.selectedWidgetDataType);

        this.retrieveVariableDescr = WidgetQueryUtils.retrieveVariableDescriptionMap[this.selectedWidgetDataType];
        this.udpateInfo = WidgetQueryUtils.updateInfoMap[this.selectedWidgetDataType];

        if (this.viewChildYasgui) {
            setTimeout(() => {
                this.viewChildYasgui.forceContentUpdate();
            })
            
        }
    }

    onQueryChanged(editor: SparqlEditorStruct, event: QueryChangedEvent) {
        editor.query = event.query;
        editor.valid = event.valid;
    }

    isDataValid(): boolean {
        //check if in the retrieve (and update, if any) query are ok
        let valid: boolean = this.isQueryValid(this.retrieveEditor);
        if (valid) {
            if (this.updateEditor.query) {
                valid = this.isQueryValid(this.updateEditor);
            }
        }
        return valid;
    }

    private isQueryValid(editor: SparqlEditorStruct): boolean {
        //Check retrieve
        //- bindings
        let retrieveQuery = this.retrieveEditor.query;
        let select = retrieveQuery.substring(retrieveQuery.toLocaleLowerCase().indexOf("select"), retrieveQuery.indexOf("{")); //restrict the check on the returned variable in select 
        for (let b of this.retrieveEditor.requiredBindings) {
            if (!select.includes("?" + b + " ")) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Required binding missing in Retrieve query: ?" + b, ModalType.warning);
                return false;
            }
        }
        //- placeholders
        let where = retrieveQuery.substring(retrieveQuery.toLocaleLowerCase().indexOf("where"), retrieveQuery.indexOf("}")); //restrict the check on the returned variable where clause
        if (!where.includes("$resource")) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "Required placeholder missing in Retrieve query: $subject", ModalType.warning);
            return false;
        }
        if (!where.includes("$trigger")) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "Required placeholder missing in Retrieve query: $trigger", ModalType.warning);
            return false;
        }

        //Check retrieve (only bindings)
        let updateQuery = this.updateEditor.query;
        if (updateQuery && updateQuery.trim() != "") { //do the checks only if update is provided
            for (let b of this.updateEditor.requiredBindings) {
                if (!updateQuery.includes("?" + b + " ")) {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, "Unable to find variable in Update query: ?" + b, ModalType.warning);
                    return false;
                }
            }
        }

        return true;
    }

    isOkEnabled() {
        return this.name && this.name.trim() != "" && this.selectedWidgetDataType && this.retrieveEditor.valid && this.updateEditor.valid;
    }

    ok() {
        if (this.isDataValid()) {
            let widgetDef: WidgetDefinition = {
                retrieve: this.retrieveEditor.query,
                update: this.updateEditor.query
            }
            //ref is the same provided as input (in edit mode) or built according the name entered by user (in create mode)
            let refParam = this.ref ? this.ref : ScopeUtils.serializeScope(Scope.PROJECT) + ":" + this.name; //store pattern at project level
            this.visualizationWidgetsService.createWidget(refParam, widgetDef, this.selectedWidgetDataType).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
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
    requiredBindings: WidgetDataBinding[];
}

enum SparqlEditorEnum {
    Retrieve = "Retrieve",
    Update = "Update"
}

class WidgetQueryUtils {

    //query skeleton

    static retrieveQueryMap: { [datatype: string]: string } = {
        [WidgetDataType.area]: "SELECT ?route_id ?location ?latitude ?longitude WHERE {\n" +
            "   $resource $trigger ?route_id .\n"+
            "   ...\n" +
            "}",
        [WidgetDataType.point]: "SELECT ?location ?latitude ?longitude WHERE {\n" +
            "   $resource $trigger ?location .\n" +
            "   ...\n" +
            "}",
        [WidgetDataType.route]: "SELECT ?route_id ?location ?latitude ?longitude WHERE {\n" +
            "   $resource $trigger ?route_id .\n" +
            "   ...\n" +
            "}",
        [WidgetDataType.series]: "SELECT ?series_id ?series_label ?value_label ?name ?value WHERE {\n" +
            "   $resource $trigger ?series_id .\n" +
            "   ...\n" +
            "}",
        [WidgetDataType.series_collection]: "SELECT ?series_collection_id ?series_label ?value_label ?series_name ?name ?value WHERE {\n" +
            "   $resource $trigger ?series_collection_id .\n" +
            "   ...\n" +
            "}",
    }

    static updateQueryMap: { [datatype: string]: string } = {
        [WidgetDataType.area]: "",
        [WidgetDataType.point]: "",
        [WidgetDataType.route]: "",
        [WidgetDataType.series]: "",
        [WidgetDataType.series_collection]: "",
    }

    //info box message

    static updateInfoMap: { [datatype: string]: string } = {
        [WidgetDataType.area]: "The update query for this kind of widget must specify how to update a single location (in terms of latitude and longitude coordinates) of the route which describe the area perimeter." +
            "This query can use the same variables and placeholders described in the Retrieve one.",
        [WidgetDataType.point]: "The update query for this kind of widget must specify how to update the location coordinates." +
            "This query can use the same variables and placeholders described in the Retrieve one.",
        [WidgetDataType.route]: "The update query for this kind of widget must specify how to update a single location (in terms of latitude and longitude coordinates) that composes the route." +
            "This query can use the same variables and placeholders described in the Retrieve one.",
        [WidgetDataType.series]: "The update query for this kind of widget must specify how to update a single value represented in the chart." +
            "This query can use the same variables and placeholders described in the Retrieve one.",
        [WidgetDataType.series_collection]: "The update query for this kind of widget must specify how to update a single value of a single series represented in the chart." +
            "This query can use the same variables and placeholders described in the Retrieve one.",
    }

    static retrieveVariableDescriptionMap: { [datatype: string]: VariableDestriptionMapping } = {
        [WidgetDataType.area]: {
            [WidgetDataBinding.route_id]: "The resource representing the route/perimeter of the area",
            [WidgetDataBinding.location]: "A resource representing a single point of the area perimeter",
            [WidgetDataBinding.latitude]: "The latitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)",
            [WidgetDataBinding.longitude]: "The longitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)",
        },
        [WidgetDataType.point]: {
            [WidgetDataBinding.location]: "The resource representing the point",
            [WidgetDataBinding.latitude]: "The latitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)",
            [WidgetDataBinding.longitude]: "The longitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)",
        },
        [WidgetDataType.route]: {
            [WidgetDataBinding.route_id]: "The resource representing the route",
            [WidgetDataBinding.location]: "A resource representing a single point of the route",
            [WidgetDataBinding.latitude]: "The latitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)",
            [WidgetDataBinding.longitude]: "The longitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)",
        },
        [WidgetDataType.series]: {
            [WidgetDataBinding.series_id]: "The resource representing the series",
            [WidgetDataBinding.series_label]: "(optional) Where admitted, this value is used for identifying the X axis in the chart",
            [WidgetDataBinding.value_label]: "(optional) Where admitted, this value is used for identifying the Y axis in the chart",
            [WidgetDataBinding.name]: "Name of a single value",
            [WidgetDataBinding.value]: "Value to be represented on the chart. This is supposed to be bound to a literal numeric value",
        },
        [WidgetDataType.series_collection]: {
            [WidgetDataBinding.series_collection_id]: "The resource representing the collection of series",
            [WidgetDataBinding.series_label]: "(optional) Where admitted, this value is used for identifying the X axis in the chart",
            [WidgetDataBinding.value_label]: "(optional) Where admitted, this value is used for identifying the Y axis in the chart",
            [WidgetDataBinding.series_name]: "Name of a single series",
            [WidgetDataBinding.name]: "Name of a single value",
            [WidgetDataBinding.value]: "Value to be represented on the chart. This is supposed to be bound to a literal numeric value",
        },
    }

}

interface VariableDestriptionMapping { [variable: string]: string } //mapping variable -> description