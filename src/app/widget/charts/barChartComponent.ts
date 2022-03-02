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

    onSelect(data: ChartData) {
        if (this.firstClick) {
            this.firstClick = false;
            if (data.extra && data.extra.nameResource) {
                //I need to do as follow since the data.extra.resource returned from the select event is an Object, not an ARTNode, so I will lost any method of ARTNode instances
                let cd = this.chartData.find(d => JSON.stringify(d.extra.nameResource) == JSON.stringify(data.extra.nameResource));
                if (cd) {
                    this.secondClick = true; //mark the second click on bar, so onDoubleClick doesn't emit any further event
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