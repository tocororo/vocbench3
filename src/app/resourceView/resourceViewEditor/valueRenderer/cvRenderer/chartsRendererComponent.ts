import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { CustomViewVariables, SeriesCollectionView, SeriesView, ViewsEnum } from "src/app/models/CustomViews";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { ChartData, ChartDataChangedEvent, ChartSeries } from "src/app/widget/charts/NgxChartsUtils";
import { AbstractViewRendererComponent } from "./abstractViewRenderer";

@Component({
    selector: "charts-renderer",
    templateUrl: "./chartsRendererComponent.html",
    host: { class: "hbox" },
})
export class ChartsRendererComponent extends AbstractViewRendererComponent {

    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;

    @Output() update = new EventEmitter();


    //input data needs to be converted in data compliant with charts
    series: ChartData[]; //a series of chart data 
    seriesCollection: ChartSeries[];

    compliantViews: ViewsEnum[];
    activeView: ViewsEnum; //currently selected/rendered view

    //input of bar chart
    xAxisLabel: string;
    yAxisLabel: string;

    viewInitialized: boolean;

    constructor(private visualizationWidgetsService: VisualizationWidgetsServices) {
        super()
    }

    ngOnInit() {
        this.compliantViews = [];
        if (this.view instanceof SeriesView) {
            this.compliantViews = [
                ViewsEnum.bar, ViewsEnum.pie
            ]
        } else  if (this.view instanceof SeriesCollectionView) {
            this.compliantViews = [ViewsEnum.line]
        }
        if (this.compliantViews.length > 0) {
            this.activeView = this.compliantViews[0];
        }

        this.processInput();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    processInput() {
        if (this.view instanceof SeriesView) {
            this.xAxisLabel = this.view.series_label;
            this.yAxisLabel = this.view.value_label;
            //convert to ChartData[]
            this.series = this.view.data.map(d => {
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
        } else if (this.view instanceof SeriesCollectionView) {
            this.xAxisLabel = this.view.series_label;
            this.yAxisLabel = this.view.value_label;
            this.seriesCollection = [];
            //convert to ChartSeries[]
            this.view.series.forEach(s => {
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
        if (this.view instanceof SeriesView) {
            let updatedData = this.view.data.find(d => d.name.equals(event.old.extra.nameResource)); //get the changed data
            updatedData.value.setValue(event.new.value+"");
            bindingsMap.set(CustomViewVariables.series_id, this.view.series_id);
            bindingsMap.set(CustomViewVariables.name, updatedData.name);
            bindingsMap.set(CustomViewVariables.value, updatedData.value);
        } else if (this.view instanceof SeriesCollectionView) {
            let updatedSeries = this.view.series.find(s => s.data.some(d => d.name.equals(event.old.extra.nameResource)))
            let updatedData = updatedSeries.data.find(d => d.name.equals(event.old.extra.nameResource));
            updatedData.value.setValue(event.new.value+"");
            bindingsMap.set(CustomViewVariables.series_collection_id, this.view.series_collection_id);
            bindingsMap.set(CustomViewVariables.series_name, updatedSeries.series_name);
            bindingsMap.set(CustomViewVariables.name, updatedData.name);
            bindingsMap.set(CustomViewVariables.value, updatedData.value);
        }
        this.visualizationWidgetsService.updateWidgetData(this.subject, this.predicate, bindingsMap).subscribe(
            () => {
                //temporarly I disable the emit event since the data is already updated locally in the view (and there is the animation that shows the variation)
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