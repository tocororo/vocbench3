import { Component, Input } from "@angular/core";
import { AbstractSeriesChartComponent } from "./abstractSeriesChartComponent";
import { ChartData } from "./NgxChartsUtils";

@Component({
    selector: "bar-chart",
    templateUrl: "./barChartComponent.html",
    host: { class: "hbox" },
})
export class BarChartComponent extends AbstractSeriesChartComponent {

    @Input() xAxisLabel: string;
    @Input() yAxisLabel: string;

    constructor() {
        super();
    }

    private firstClick: boolean; //tells if first click has already registered
    onSelect(data: ChartData) {
        if (this.firstClick) {
            this.firstClick = false;
            if (data.extra && data.extra.nameResource) {
                //I need to do as follow since the data.extra.resource returned from the select event is an Object, not an ARTNode, so I will lost any method of ARTNode instances
                let cd = this.chartData.find(d => JSON.stringify(d.extra.nameResource) == JSON.stringify(data.extra.nameResource));
                if (cd) {
                    this.doubleClick.emit(cd.extra.nameResource);
                }
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

}