import { Component } from "@angular/core";
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

    data: ChartData[] = []

    randColorScheme = { domain: [] };

    // colorSchemeSet: ColorSet = {
    //     domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
    // };
    // colorSchemeName: string = ColorSetEnum.fire;

    //options
    gradient: boolean = true;
    showLegend: boolean = true;
    showLabels: boolean = true;
    isDoughnut: boolean = true;
    legendPosition: string = 'right';

    constructor() { }

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

    getTooltipText(entry: ChartItem) {
        const label = entry.data.extra.label;
        const val = entry.data.value.toLocaleString();
        return `
            <span class="tooltip-label">Label: ${label}</span>
            <span class="tooltip-val">Value: ${val}</span>
        `;
    }

    onSelect(data): void {
        console.log('Item clicked', data);
    }

    onActivate(data): void {
        // console.log('Activate', JSON.parse(JSON.stringify(data)));
    }

    onDeactivate(data): void {
        // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
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