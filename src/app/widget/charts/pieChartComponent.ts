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

    onDblClick(event: { data: ChartData, nativeEvent: MouseEvent }) {
        if (event.data.extra && event.data.extra.nameResource) {
            //I need to do as follow since the data.extra.resource returned from the select event is an Object, not an ARTNode, so I will lost any method of ARTNode instances
            let cd = this.chartData.find(d => JSON.stringify(d.extra.nameResource) == JSON.stringify(event.data.extra.nameResource))
            if (cd) {
                this.doubleClick.emit(cd.extra.nameResource);
            }
        }
    }

}