import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode } from "src/app/models/ARTResources";
import { Widget } from "src/app/models/VisualizationWidgets";

@Directive()
export abstract class AbstractWidgetComponent {
    @Input() widget: Widget;
    @Input() readonly: boolean;

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter;

    editAuthorized: boolean = true;

    /**
     * normalizes the input data in a format compliant for the widget
     */
    protected abstract processInput(): void;

    onDoubleClick(res: ARTNode) {
        this.doubleClick.emit(res);
    }

}