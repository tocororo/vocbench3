import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AreaWidget, PointWidget, RouteWidget, Widget, WidgetCategory } from "src/app/models/VisualizationWidgets";

@Component({
    selector: "widget-renderer",
    templateUrl: "./widgetRenderer.html",
    host: { class: "hbox" },
    styles: [`
        :host {
            padding: 3px;
            height: 300px;
        }
    `]
})
export class WidgetRenderer {

    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() widget: Widget;
    @Input() rendering: boolean;
    @Input() readonly: boolean;

    @Output() update = new EventEmitter(); //a change has been done => request to update the RV
    @Output() doubleClick: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    activeWidgetRenderer: WidgetCategory;

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['widget']) {
            this.init();
        }
    }

    private init() {
        if (this.widget instanceof AreaWidget || this.widget instanceof RouteWidget || this.widget instanceof PointWidget) {
            this.activeWidgetRenderer = WidgetCategory.map;
        } else {
            this.activeWidgetRenderer = WidgetCategory.chart;
        }
        
    }

    onUpdate() {
        this.update.emit();
    }

    onDoubleClick(res: ARTResource) {
        this.doubleClick.emit(res);
    }


}