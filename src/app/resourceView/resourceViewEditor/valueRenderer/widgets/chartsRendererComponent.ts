import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { SeriesCollectionWidget, SeriesWidget, WidgetDataBinding, WidgetEnum } from "src/app/models/VisualizationWidgets";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { ChartDataChangedEvent } from "src/app/widget/charts/abstractChartComponent";
import { ChartData, ChartSeries } from "src/app/widget/charts/NgxChartsUtils";
import { AbstractWidgetComponent } from "./abstractWidgetRenderer";

@Component({
    selector: "charts-renderer",
    templateUrl: "./chartsRendererComponent.html",
    host: { class: "hbox" },
})
export class ChartsRendererComponent extends AbstractWidgetComponent {

    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;

    @Output() update = new EventEmitter();


    //input data needs to be converted in data compliant with charts
    series: ChartData[]; //a series of chart data 
    seriesCollection: ChartSeries[];

    compliantWidgets: WidgetEnum[];
    activeWidget: WidgetEnum; //currently selected/rendered widget

    //input of bar chart
    xAxisLabel: string;
    yAxisLabel: string;

    viewInitialized: boolean;

    constructor(private visualizationWidgetsService: VisualizationWidgetsServices) {
        super()
    }

    ngOnInit() {
        this.compliantWidgets = [];
        if (this.widget instanceof SeriesWidget) {
            this.compliantWidgets = [
                WidgetEnum.bar, WidgetEnum.pie
            ]
        } else  if (this.widget instanceof SeriesCollectionWidget) {
            this.compliantWidgets = [
                WidgetEnum.bar
            ]
        }
        if (this.compliantWidgets.length > 0) {
            this.activeWidget = this.compliantWidgets[0];
        }

        this.processInput();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    processInput() {
        if (this.widget instanceof SeriesWidget) {
            this.xAxisLabel = this.widget.x_axis_label;
            this.yAxisLabel = this.widget.y_axis_label;

            this.series = [];
            this.widget.data.forEach(d => {
                let cd: ChartData = {
                    name: d.name.getShow(),
                    value: Number.parseFloat(d.value.getShow()),
                    extra: {
                        valueDatatype: d.value.getDatatype(),
                        nameResource: d.name
                    }
                }
                this.series.push(cd);
            })
        } else if (this.widget instanceof SeriesCollectionWidget) {
            //TODO
        }
    }

    onDataChanged(event: ChartDataChangedEvent) {
        let bindingsMap: Map<string, ARTNode> = new Map();
        if (this.widget instanceof SeriesWidget) {
            bindingsMap.set(WidgetDataBinding.series_id, this.widget.series_id);
            let updatedData = this.widget.data.find(d => d.name.equals(event.old.extra.nameResource)); //get the changed data
            updatedData.value.setValue(event.new.value+"");
            bindingsMap.set(WidgetDataBinding.name, updatedData.name);
            bindingsMap.set(WidgetDataBinding.value, updatedData.value);
            this.visualizationWidgetsService.updateWidgetData(this.subject, this.predicate, bindingsMap).subscribe(
                () => {
                    // this.update.emit();
                }
            )
        }
    }

    onWidgetChanged() {
        //hack to make chart initialized well into the container
        this.viewInitialized = false;
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    edit() {
    }

}