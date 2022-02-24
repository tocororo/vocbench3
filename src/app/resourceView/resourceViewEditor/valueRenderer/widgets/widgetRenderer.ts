import { Component, EventEmitter, Input, Output, SimpleChange, SimpleChanges } from "@angular/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { WidgetCategory, WidgetDataRecord, WidgetDataType } from "src/app/models/VisualizationWidgets";

@Component({
    selector: "widget-renderer",
    templateUrl: "./widgetRenderer.html",
    host: { class: "hbox" },
    styles: [`
        :host {
            padding: 3px;
        }
    `]
})
export class WidgetRenderer {

    // @Input() partition: ResViewPartition;
    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() widgetData: WidgetDataRecord;
    @Input() rendering: boolean;
    @Input() readonly: boolean;

    // @Output() delete = new EventEmitter(); //request to delete the object ("delete" action of the editable-resource or "-" button of reified-resource)
    @Output() update = new EventEmitter(); //a change has been done => request to update the RV

    activeWidgetRenderer: WidgetCategory;

    

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['widgetData']) {
            this.init();
        }
    }

    private init() {
        //according the data type, choose the widget (category) to use
        let wdt: WidgetDataType = this.widgetData.type;
        if (wdt == WidgetDataType.area || wdt == WidgetDataType.point || wdt == WidgetDataType.route) {
            this.activeWidgetRenderer = WidgetCategory.map;
        } else {
            this.activeWidgetRenderer = WidgetCategory.chart;
        }
    }

    onUpdate() {
        this.update.emit();
    }


}