import { Directive, Input } from "@angular/core";
import { WidgetDataRecord } from "src/app/models/VisualizationWidgets";

@Directive()
export abstract class AbstractWidgetComponent {
    @Input() data: WidgetDataRecord;
    @Input() readonly: boolean;

    editAuthorized: boolean = true;

    /**
     * normalizes the input data in a format compliant for the widget
     */
    protected abstract processInput(): void;

}