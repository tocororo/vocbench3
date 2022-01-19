import { Component } from "@angular/core";
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

    data: ChartData[] = []

    randColorScheme = { domain: [] };
    // colorScheme = {
    //     domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    // };

    // options
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = true;
    showXAxisLabel = true;
    xAxisLabel = 'Country';
    showYAxisLabel = true;
    yAxisLabel = 'Population';

    constructor() {
    }

    ngOnInit() {
        //generate random data
        for (let i = 0; i < ((Math.random() * 10) + 1); i++) {
            this.data.push({
                name: "value" + i,
                extra: { label: "label" + i },
                value: Math.random() * 1000
            })
        }
        //generate random colors
        this.randColorScheme.domain = this.data.map((d, idx) => {
            return NgxChartsUtils.getRandColor(this.data.length, idx)
        })
    }

    onSelect(data): void {
        console.log('Item clicked', data);
    }

}

interface ChartItem {
    data: ChartData;
    endAngle: number;
    index: number;
    padAngle: number;
    pos: number[];
    startAngle: number;
    value: number;
}