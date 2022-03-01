import { Component, Input, SimpleChanges } from "@angular/core";
import { Observable, of } from "rxjs";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AreaWidget, PointWidget, RouteWidget, SeriesCollectionWidget, SeriesWidget, Widget, WidgetDataBinding, WidgetDataRecord, WidgetDataType } from "src/app/models/VisualizationWidgets";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { ResViewPartition } from "../../../../models/ResourceView";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";

@Component({
    selector: "widgets-renderer",
    templateUrl: "./widgetsPartitionRenderer.html",
})
export class WidgetsPartitionRenderer extends PartitionRendererMultiRoot {

    @Input() partition: ResViewPartition;
    addBtnImgSrc = "./assets/images/icons/actions/property_create.png";

    predWidgetsList: PredWidgets[] = [];

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        private visualizationWidgetsService: VisualizationWidgetsServices) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }


    ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);
        if (changes['predicateObjectList']) {
            this.retrieveWidgetData();
        }
    }

    private retrieveWidgetData() {
         this.predWidgetsList = [];
         this.predicateObjectList.forEach(po => {
            this.visualizationWidgetsService.getWidgetData(this.resource, po.getPredicate()).subscribe(
                (data: WidgetDataRecord[]) => {
                    //convert the data to a structure <predicate> -> <widget list>
                    let widgets: Widget[] = [];
                    data.forEach(d => {
                        let widget: Widget;
                        if (d.type == WidgetDataType.point) {
                            let locationDescr = d.bindingsList[0];
                            let w: PointWidget = new PointWidget();
                            w.location = <ARTResource>locationDescr[WidgetDataBinding.location];
                            w.latitude = <ARTLiteral>locationDescr[WidgetDataBinding.latitude];
                            w.longitude = <ARTLiteral>locationDescr[WidgetDataBinding.longitude];
                            widget = w;
                        } else if (d.type == WidgetDataType.area) {
                            let w: AreaWidget = new AreaWidget();
                            w.routeId = <ARTResource>d.bindingsList[0][WidgetDataBinding.route_id]; //by construction route ID is the same for each record
                            d.bindingsList.forEach(b => {
                                w.locations.push({
                                    location: <ARTResource>b[WidgetDataBinding.location],
                                    latitude: <ARTLiteral>b[WidgetDataBinding.latitude],
                                    longitude: <ARTLiteral>b[WidgetDataBinding.longitude]
                                })
                            });
                            widget = w;
                        } else if (d.type == WidgetDataType.route) {
                            let w: RouteWidget = new RouteWidget();
                            w.routeId = <ARTResource>d.bindingsList[0][WidgetDataBinding.route_id]; //by construction route ID is the same for each record
                            d.bindingsList.forEach(b => {
                                w.locations.push({
                                    location: <ARTResource>b[WidgetDataBinding.location],
                                    latitude: <ARTLiteral>b[WidgetDataBinding.latitude],
                                    longitude: <ARTLiteral>b[WidgetDataBinding.longitude]
                                })
                            });
                            widget = w;
                        } else if (d.type == WidgetDataType.series) {
                            let w: SeriesWidget = new SeriesWidget();
                            //series_id, x_axis_label and y_axis_label are supposed to be the same for all the data
                            w.series_id = <ARTResource>d.bindingsList[0][WidgetDataBinding.series_id];
                            w.x_axis_label = d.bindingsList[0][WidgetDataBinding.x_axis_label].getShow();
                            w.y_axis_label = d.bindingsList[0][WidgetDataBinding.y_axis_label].getShow();
                            d.bindingsList.forEach(b => {
                                w.data.push({
                                    name: <ARTResource>b[WidgetDataBinding.name],
                                    value: <ARTLiteral>b[WidgetDataBinding.value]
                                })
                            });
                            widget = w;
                        } else if (d.type == WidgetDataType.series_collection) {
                            let w: SeriesCollectionWidget = new SeriesCollectionWidget();
                            //series_collection_id, x_axis_label and y_axis_label are supposed to be the same for all the data
                            w.series_collection_id = <ARTResource>d.bindingsList[0][WidgetDataBinding.series_collection_id];
                            w.x_axis_label = d.bindingsList[0][WidgetDataBinding.x_axis_label].getShow();
                            w.y_axis_label = d.bindingsList[0][WidgetDataBinding.y_axis_label].getShow();
                            d.bindingsList.forEach(b => {
                                let seriesName = b[WidgetDataBinding.series_name];
                                let data = {
                                    name: <ARTResource>b[WidgetDataBinding.name],
                                    value:  <ARTLiteral>b[WidgetDataBinding.value]
                                };
                                let series = w.series.find(s => s.series_name.equals(seriesName));
                                if (series) {
                                    series.data.push(data)
                                } else {
                                    w.series.push({
                                        series_name: seriesName,
                                        data: [data]
                                    })
                                }
                            });
                            widget = w;
                        }
                        widgets.push(widget);
                    })
                    this.predWidgetsList.push({
                        predicate: po.getPredicate(),
                        widgets: widgets,
                    });
                }
            );

            po.getPredicate()
        })
    }

    //@Override
    getPredicateToEnrich(): Observable<ARTURIResource> {
        return null;
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.enrichProperty(predicate);
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            () => {
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }

}

interface PredWidgets {
    predicate: ARTURIResource;
    widgets: Widget[];
}