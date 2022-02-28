import { Component } from "@angular/core";
import { CreationModalServices } from "../modal/creationModal/creationModalServices";
import { AbstractChartComponent } from "./abstractChartComponent";
import { ChartData } from "./NgxChartsUtils";

@Component({
    selector: "pie-chart",
    templateUrl: "./pieChartComponent.html",
    host: { class: "hbox" },
    styleUrls: ["./chartComponent.css"]
})
export class PieChartComponent extends AbstractChartComponent {

    constructor(creationModals: CreationModalServices) {
        super(creationModals);
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