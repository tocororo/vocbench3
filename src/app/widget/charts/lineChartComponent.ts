import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTNode, ARTURIResource } from "src/app/models/ARTResources";
import { CreationModalServices } from "../modal/creationModal/creationModalServices";
import { ChartData, ChartDataChangedEvent, ChartSeries } from "./NgxChartsUtils";

@Component({
    selector: "line-chart",
    templateUrl: "./lineChartComponent.html",
    host: { class: "hbox" },
})
export class LineChartComponent {

    @Input() xAxisLabel: string;
    @Input() yAxisLabel: string;
    @Input() chartData: ChartSeries[];
    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter;
    @Output() dataChanged: EventEmitter<ChartDataChangedEvent> = new EventEmitter();

    selectedData: SelectEventData;

    colorScheme: string = "picnic";

    constructor(private creationModals: CreationModalServices) {
    }

    ngOnInit() {
    }

    edit() {
        let editingSeries: ChartSeries = this.chartData.find(s => s.name == this.selectedData.series);
        let oldData: ChartData = editingSeries.series.find(s => s.name == this.selectedData.name);

        let datatype: ARTURIResource = new ARTURIResource(oldData.extra.valueDatatype);
        this.creationModals.newTypedLiteral("", null, new ARTLiteral(oldData.value+"", datatype.getURI()), [datatype]).then(
            (literals: ARTLiteral[]) => {
                let newValue = literals[0];

                let newData: ChartData = {
                    name: oldData.name,
                    value: Number(newValue.getValue())
                }
                if (oldData.extra) {
                    newData.extra = {
                        nameResource: oldData.extra.nameResource,
                        valueDatatype: newValue.getDatatype()
                    }
                }
                editingSeries.series[editingSeries.series.indexOf(oldData)] = newData; //replace old with new value
                this.chartData = this.chartData.slice(); //slice so that chartData is recognized as a new list and the chart is updated

                this.dataChanged.emit({ old: oldData, new: newData });
            },
            () => {}
        );
    }

    private firstClick: boolean; //tells if first click has already registered
    onSelect(data: SelectEventData) {
        this.selectData(data);
        if (this.firstClick) { // => double click 
            this.firstClick = false;
            let series: ChartSeries = this.chartData.find(s => s.name == data.series);
            let chartData: ChartData = series.series.find(s => s.name == data.name);
            if (chartData.extra && chartData.extra.nameResource) {
                this.doubleClick.emit(chartData.extra.nameResource);
            }
        } else {
            this.firstClick = true;
            setTimeout(() => {
                if (this.firstClick) {
                    this.firstClick = false;
                }
            }, 500);
        }
    }


    selectData(series: SelectEventData) {
        this.selectedData = series;
    }
    // onActivate(event: any) {
    //     this.activeEntry = event;
    //     console.log("this.activeEntry", this.activeEntry)
    // }
    // onDeactivate() {
    //     this.activeEntry = null;
    //     console.log("this.activeEntry", this.activeEntry)
    // }

}

interface SelectEventData {
    series: string;
    name: string;
    value: number;
}