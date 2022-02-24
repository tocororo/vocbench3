import { Component, Input } from "@angular/core";
import { ChartData, NgxChartsUtils } from "./NgxChartsUtils";

@Component({
    selector: "bar-chart",
    templateUrl: "./barChartComponent.html",
    styles: [`
        :host {
            width: 100%;
            height: 200px;
        }
    `]
})
export class BarChartComponent {

    @Input() chartData: ChartData[];
    @Input() xAxisLabel: string;
    @Input() yAxisLabel: string;

    randColorScheme = { domain: [] };

    // options
    showXAxis = true;
    showYAxis = true;
    showLegend = false;
    showXAxisLabel = true;
    showYAxisLabel = true;

    ngOnInit() {
        //generate random colors
        // this.randColorScheme.domain = this.chartData.map((d, idx) => {
        //     return NgxChartsUtils.getRandColor(this.chartData.length, idx)
        // })
    }

    onSelect(data: ChartData): void {
        console.log('Item clicked', data);
    }

}