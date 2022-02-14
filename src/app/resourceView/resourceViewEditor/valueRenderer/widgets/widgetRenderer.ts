import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { DataTypeBindingsMap, WidgetCategory, WidgetDataRecord, WidgetDataType, WidgetDataTypeCompliantMap, WidgetEnum } from "src/app/models/VisualizationWidgets";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";

@Component({
    selector: "widget-renderer",
    templateUrl: "./widgetRenderer.html",
    host: { class: "hbox" },
})
export class WidgetRenderer {

    // @Input() partition: ResViewPartition;
    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() object: ARTNode;
    @Input() rendering: boolean;
    @Input() readonly: boolean;

    // @Output() delete = new EventEmitter(); //request to delete the object ("delete" action of the editable-resource or "-" button of reified-resource)
    @Output() update = new EventEmitter(); //a change has been done => request to update the RV

    activeWidgetRenderer: WidgetCategory;

    widgetData: WidgetDataRecord[];

    constructor(private visualizationWidgetsService: VisualizationWidgetsServices) {}

    ngOnInit() {
        this.visualizationWidgetsService.getVisualizationData(this.subject, this.predicate).subscribe(
            (data: WidgetDataRecord[]) => {
                this.widgetData = data;
                //according the bindings returned in the response data, detect which widgets can be used to represent them
                let compliantDataTypes: WidgetDataType[] = DataTypeBindingsMap.getCompliantDataTypes(data[0].getBindings());
                if (compliantDataTypes.includes(WidgetDataType.point)) {
                    this.activeWidgetRenderer = WidgetCategory.map;
                } else if (compliantDataTypes.includes(WidgetDataType.series)) {
                    this.activeWidgetRenderer = WidgetCategory.chart;
                }
            }
        );
    }

    onUpdate() {
        this.update.emit();
    }


}