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
    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter; //emits the resource related to the double click graphic element. Null if double click on empty area
    @Output() dataChanged: EventEmitter<ChartDataChangedEvent> = new EventEmitter();

    /*
    in case I want to "curve" the chart, I can import
    import * as d3 from 'd3';
    define here something like
    curve = d3.curveBasis;
    and give it in input to the chart like
    [curve]="curve"
    */

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
        this.creationModals.newTypedLiteral("", null, new ARTLiteral(oldData.value + "", datatype.getURI()), [datatype]).then(
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
            () => { }
        );
    }

    /**
     * CLICK/DOUBLE-CLICK HANDLER
     */

    private firstClick: boolean; //tells if first click has already registered
    private secondClick: boolean; //tells if the second click/double-click is registered (used for differentiate double click on any point (dblclick event) from double click on a bar (select event x2))

    /**
     * Handler of dblclick on chart. 
     * This is invoked any time a double click is detected, even if it is done on a bar (where also onSelect is triggered).
     * In such case, I observed that select event is fired before dblclick, so I can differentiate here the two cases (dbl click on bar OR on empty area)
     */
    onDoubleClick() {
        setTimeout(() => {
            //if secondClick is false, it means that the double click has been done on an empty area
            if (!this.secondClick) {
                this.doubleClick.emit();
            } else { //secondClick has been set to true in onSelect(), so the double click has been done on a bar => do nothing, just reset secondClick
                this.secondClick = false;
            }
        })
    }

    onSelect(data: SelectEventData) {
        this.selectData(data);
        if (this.firstClick) { // => double click 
            this.firstClick = false;
            let series: ChartSeries = this.chartData.find(s => s.name == data.series);
            let chartData: ChartData = series.series.find(s => s.name == data.name);
            if (chartData.extra && chartData.extra.nameResource) {
                this.secondClick = true; //mark the second click on bar, so onDoubleClick doesn't emit any further event
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

}

interface SelectEventData {
    series: string;
    name: string;
    value: number;
}