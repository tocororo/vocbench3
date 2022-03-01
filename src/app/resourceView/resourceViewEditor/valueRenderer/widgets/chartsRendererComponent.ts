import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { SeriesCollectionWidget, SeriesWidget, WidgetDataBinding, WidgetEnum } from "src/app/models/VisualizationWidgets";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { ChartData, ChartDataChangedEvent, ChartSeries } from "src/app/widget/charts/NgxChartsUtils";
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
            this.compliantWidgets = [WidgetEnum.line]
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
            //convert to ChartData[]
            this.series = this.widget.data.map(d => {
                let cd: ChartData = {
                    name: d.name.getShow(),
                    value: Number.parseFloat(d.value.getShow()),
                    extra: {
                        valueDatatype: d.value.getDatatype(),
                        nameResource: d.name
                    }
                }
                return cd;
            })
        } else if (this.widget instanceof SeriesCollectionWidget) {
            this.xAxisLabel = this.widget.x_axis_label;
            this.yAxisLabel = this.widget.y_axis_label;
            this.seriesCollection = [];
            //convert to ChartSeries[]
            this.widget.series.forEach(s => {
                let series = s.data.map(d => {
                    let cd: ChartData = {
                        name: d.name.getShow(),
                        value: Number.parseFloat(d.value.getShow()),
                        extra: {
                            valueDatatype: d.value.getDatatype(),
                            nameResource: d.name
                        }
                    }
                    return cd;
                });
                let chartSeries: ChartSeries = {
                    name: s.series_name.getShow(),
                    series: series,
                };
                this.seriesCollection.push(chartSeries);
            })
        }
    }

    onDataChanged(event: ChartDataChangedEvent) {
        let bindingsMap: Map<string, ARTNode> = new Map();
        if (this.widget instanceof SeriesWidget) {
            let updatedData = this.widget.data.find(d => d.name.equals(event.old.extra.nameResource)); //get the changed data
            updatedData.value.setValue(event.new.value+"");
            bindingsMap.set(WidgetDataBinding.series_id, this.widget.series_id);
            bindingsMap.set(WidgetDataBinding.name, updatedData.name);
            bindingsMap.set(WidgetDataBinding.value, updatedData.value);
        } else if (this.widget instanceof SeriesCollectionWidget) {
            let updatedSeries = this.widget.series.find(s => s.data.some(d => d.name.equals(event.old.extra.nameResource)))
            let updatedData = updatedSeries.data.find(d => d.name.equals(event.old.extra.nameResource));
            updatedData.value.setValue(event.new.value+"");
            bindingsMap.set(WidgetDataBinding.series_collection_id, this.widget.series_collection_id);
            bindingsMap.set(WidgetDataBinding.series_name, updatedSeries.series_name);
            bindingsMap.set(WidgetDataBinding.name, updatedData.name);
            bindingsMap.set(WidgetDataBinding.value, updatedData.value);
        }
        this.visualizationWidgetsService.updateWidgetData(this.subject, this.predicate, bindingsMap).subscribe(
            () => {
                //temporarly I disable the emit event since the data is already updated locally in the widget (and there is the animation that shows the variation)
                //and there's no need to refresh the resource view
                // this.update.emit();
            }
        )
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