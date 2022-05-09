import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ColorHelper } from "@swimlane/ngx-charts";
import { ARTLiteral, ARTURIResource } from "src/app/models/ARTResources";
import { CreationModalServices } from "../modal/creationModal/creationModalServices";
import { ChartData, ChartDataChangedEvent, NgxChartsUtils } from "./NgxChartsUtils";

@Component({
    selector: "series-chart-legend",
    templateUrl: "./seriesChartLegendComponent.html",
    styles: [`
    .legend-entry {
        display: flex;
        align-items: center;
        width: 230px;
        font-size: 12px;
        margin: 0.5rem;
    }
    .legend-label { 
        cursor: pointer;
        color: #888;
        flex: 1;
    }
    .legend-label.active { 
        color: #000;
    }
    `]
})
export class SeriesChartLegendComponent {

    @Input() chartData: ChartData[];
    @Input() activeEntries: ChartData[] = [];
    @Input() colorScheme: string;
    @Input() readonly: boolean;
    @Output() dataChanged: EventEmitter<ChartDataChangedEvent> = new EventEmitter();
    @Output() activate: EventEmitter<ChartData> = new EventEmitter();
    @Output() deactivate: EventEmitter<ChartData> = new EventEmitter();

    colorHelper: ColorHelper;

    constructor(private creationModals: CreationModalServices) {}
    
    ngOnInit() {
        this.colorHelper = new ColorHelper(this.colorScheme, 'ordinal', [], null);
    }

    edit(data: ChartData) {
        let oldData = NgxChartsUtils.getDataItem(this.chartData, data);

        let datatype: ARTURIResource = new ARTURIResource(oldData.extra.valueDatatype);
        this.creationModals.newTypedLiteral("", null, new ARTLiteral(oldData.value+"", datatype.getURI()), [datatype]).then(
            (literals: ARTLiteral[]) => {
                let newValue = literals[0];

                let newData: ChartData = {
                    name: oldData.name,
                    value: Number(newValue.getValue())
                };
                if (oldData.extra) {
                    newData.extra = {
                        nameResource: oldData.extra.nameResource,
                        valueDatatype: newValue.getDatatype()
                    };
                }
                
                this.dataChanged.emit({ old: oldData, new: newData });
            },
            () => {}
        );
    }

    isLabelActive(data: ChartData): boolean {
        return this.activeEntries[0] != null && NgxChartsUtils.chartDataEquals(data, this.activeEntries[0]);
    }

    onActivate(data: ChartData) {
        this.activate.emit(data);
    }
    onDeactivate() {
        this.deactivate.emit();
    }

}