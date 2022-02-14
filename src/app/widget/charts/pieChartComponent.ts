import { Component, Input } from "@angular/core";
import { ChartData, ColorSet, NgxChartsUtils } from "./NgxChartsUtils";

@Component({
    selector: "pie-chart",
    templateUrl: "./pieChartComponent.html",
    styles: [`
        :host {
            width: 100%;
            height: 200px;
        }
    `]
})
export class PieChartComponent {

    @Input() chartData: ChartData[];

    randColorScheme = { domain: [] };

    //options
    showLegend: boolean = false;
    showLabels: boolean = true;
    isDoughnut: boolean = true;
    legendPosition: string = 'right';

    constructor() { }

    ngOnInit() {
        //generate random colors
        this.randColorScheme.domain = this.chartData.map((d, idx) => {
            return NgxChartsUtils.getRandColor(this.chartData.length, idx)
        })
    }

    onSelect(data: ChartData): void {
        console.log('Item clicked', data);
    }

    onActivate(data): void {
        // console.log('Activate', JSON.parse(JSON.stringify(data)));
    }

    onDeactivate(data): void {
        // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }

}