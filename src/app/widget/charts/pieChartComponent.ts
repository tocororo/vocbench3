import { Component } from "@angular/core";
import { AbstractSeriesChartComponent } from "./abstractSeriesChartComponent";
import { ChartData } from "./NgxChartsUtils";

@Component({
    selector: "pie-chart",
    templateUrl: "./pieChartComponent.html",
    host: { class: "hbox" },
})
export class PieChartComponent extends AbstractSeriesChartComponent {

    constructor() {
        super();
    }

    /**
     * Unlike other charts in ngx-charts, pie-chart handles dblclick event.
     * If double click is on a "slice" of the pie, the event contains both MouseEvent and the data related to the slice,
     * otherwise, if it is on an empty area, event is a "standard" MouseEvent
     * @param event 
     */
    onDblClick(event: PieChartMouseEvent | MouseEvent) {
        if (event instanceof MouseEvent) {
            this.doubleClick.emit();
        } else {
            if (event.data.extra && event.data.extra.nameResource) {
                //I need to do as follow since the data.extra.resource returned from the select event is an Object, not an ARTNode, so I will lost any method of ARTNode instances
                let cd = this.chartData.find(d => JSON.stringify(d.extra.nameResource) == JSON.stringify(event.data.extra.nameResource));
                if (cd) {
                    this.doubleClick.emit(cd.extra.nameResource);
                }
            }
        }
    }

}

interface PieChartMouseEvent {
    data: ChartData;
    nativeEvent: MouseEvent;
}