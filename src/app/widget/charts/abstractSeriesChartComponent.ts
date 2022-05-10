import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode } from "src/app/models/ARTResources";
import { ChartData, ChartDataChangedEvent } from "./NgxChartsUtils";

@Directive()
export abstract class AbstractSeriesChartComponent {

    @Input() chartData: ChartData[];
    @Input() readonly: boolean;

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter(); //emits the resource related to the double click graphic element. Null if double click on empty area
    @Output() dataChanged: EventEmitter<ChartDataChangedEvent> = new EventEmitter();

    colorScheme: string = "picnic";

    activeEntries: ChartData[] = [];

    constructor() {}

    onActivate(data: ChartData) {
        this.activeEntries = [{ name: data.name, value: data.value }];
    }
    onDeactivate() {
        this.activeEntries = [];
    }

    onDataChanged(event: ChartDataChangedEvent) {
        this.dataChanged.emit(event);
    }

}

