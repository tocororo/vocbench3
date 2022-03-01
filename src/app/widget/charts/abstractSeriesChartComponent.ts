import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode } from "src/app/models/ARTResources";
import { ChartData, ChartDataChangedEvent } from "./NgxChartsUtils";

@Directive()
export abstract class AbstractSeriesChartComponent {

    @Input() chartData: ChartData[];

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter;
    @Output() dataChanged: EventEmitter<ChartDataChangedEvent> = new EventEmitter();

    colorScheme: string = "picnic";

    activeEntries: ChartData[] = [];

    constructor() {}

    onActivate(data: ChartData) {
        this.activeEntries = [{ name: data.name, value: data.value }]
    }
    onDeactivate() {
        this.activeEntries = [];
    }

    onDataChanged(event: ChartDataChangedEvent) {
        this.dataChanged.emit(event);
    }

}

