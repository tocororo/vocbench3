import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ColorHelper } from "@swimlane/ngx-charts";
import { ARTLiteral, ARTNode, ARTURIResource } from "src/app/models/ARTResources";
import { CreationModalServices } from "../modal/creationModal/creationModalServices";
import { ChartData, NgxChartsUtils } from "./NgxChartsUtils";

@Directive()
export abstract class AbstractChartComponent {

    @Input() chartData: ChartData[];

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter;
    @Output() dataChanged: EventEmitter<ChartDataChangedEvent> = new EventEmitter();

    colorScheme: string = "picnic";
    colorHelper = new ColorHelper(this.colorScheme, 'ordinal', [], null);

    activeEntries: ChartData[] = [];

    creationModals: CreationModalServices;
    constructor(creationModals: CreationModalServices) {
        this.creationModals = creationModals;
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
                }
                if (oldData.extra) {
                    newData.extra = {
                        nameResource: oldData.extra.nameResource,
                        valueDatatype: newValue.getDatatype()
                    }
                }
                
                this.chartData[this.chartData.indexOf(oldData)] = newData; //replace old with new value
                this.chartData = this.chartData.slice(); //slice so that chartData is recognized as a new list and the chart is updated

                this.dataChanged.emit({ old: oldData, new: newData });
            },
            () => {}
        );
        
    }

    isLabelActive(data: ChartData): boolean {
        return this.activeEntries[0] != null && NgxChartsUtils.chartDataEquals(data, this.activeEntries[0]);
    }
    
    onActivate(data: ChartData) {
        this.activeEntries = [{ name: data.name, value: data.value }]
    }
    onDeactivate() {
        this.activeEntries = [];
    }

}

export interface ChartDataChangedEvent {
    old: ChartData;
    new: ChartData;
}