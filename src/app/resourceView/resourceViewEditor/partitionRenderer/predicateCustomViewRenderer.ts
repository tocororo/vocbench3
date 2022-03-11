import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { AbstractView, AreaView, CustomViewModel, CustomViewVariables, PointView, PredicateCustomView, RouteView, SeriesCollectionView, SeriesView } from "src/app/models/CustomViews";
import { ARTLiteral, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";

@Component({
    selector: "pred-custom-views-renderer",
    templateUrl: "./predicateCustomViewRenderer.html",
    styles: [`
        :host {
            display: block;
            margin-bottom: 4px;
        }
    `]
    
})
export class PredicateCustomViewsRenderer {

    /**
     * INPUTS / OUTPUTS
     */

    @Input('pred-cv') predicateCustomView: PredicateCustomView;
    @Input() resource: ARTResource; //resource described
    @Input() readonly: boolean;
    @Input() rendering: boolean;
    @Input() partition: ResViewPartition;
    @Output() update = new EventEmitter();
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    /**
     * ATTRIBUTES
     */

    predicate: ARTURIResource;
    customViews: AbstractView[];

    constructor() {}

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] || changes['readonly']) {
            this.initActionsStatus();
        }
        if (changes['predicateCustomView']) {
            this.predicate = this.predicateCustomView.predicate;
            this.initCustomViewData();
        }
    }

    private initCustomViewData() {
        //convert the data to a proper view structure according the model type
        this.customViews = [];
        this.predicateCustomView.data.forEach(d => {
            let view: AbstractView;
            if (d.model == CustomViewModel.point) {
                let locationDescr = d.bindingsList[0];
                let v: PointView = new PointView();
                v.location = <ARTResource>locationDescr[CustomViewVariables.location];
                v.latitude = <ARTLiteral>locationDescr[CustomViewVariables.latitude];
                v.longitude = <ARTLiteral>locationDescr[CustomViewVariables.longitude];
                view = v;
            } else if (d.model == CustomViewModel.area) {
                let v: AreaView = new AreaView();
                v.routeId = <ARTResource>d.bindingsList[0][CustomViewVariables.route_id]; //by construction route ID is the same for each record
                d.bindingsList.forEach(b => {
                    v.locations.push({
                        location: <ARTResource>b[CustomViewVariables.location],
                        latitude: <ARTLiteral>b[CustomViewVariables.latitude],
                        longitude: <ARTLiteral>b[CustomViewVariables.longitude]
                    })
                });
                view = v;
            } else if (d.model == CustomViewModel.route) {
                let v: RouteView = new RouteView();
                v.routeId = <ARTResource>d.bindingsList[0][CustomViewVariables.route_id]; //by construction route ID is the same for each record
                d.bindingsList.forEach(b => {
                    v.locations.push({
                        location: <ARTResource>b[CustomViewVariables.location],
                        latitude: <ARTLiteral>b[CustomViewVariables.latitude],
                        longitude: <ARTLiteral>b[CustomViewVariables.longitude]
                    })
                });
                view = v;
            } else if (d.model == CustomViewModel.series) {
                let v: SeriesView = new SeriesView();
                //series_id, series_label and value_label are supposed to be the same for all the data
                v.series_id = <ARTResource>d.bindingsList[0][CustomViewVariables.series_id];
                v.series_label = d.bindingsList[0][CustomViewVariables.series_label].getShow();
                v.value_label = d.bindingsList[0][CustomViewVariables.value_label].getShow();
                d.bindingsList.forEach(b => {
                    v.data.push({
                        name: <ARTResource>b[CustomViewVariables.name],
                        value: <ARTLiteral>b[CustomViewVariables.value]
                    })
                });
                view = v;
            } else if (d.model == CustomViewModel.series_collection) {
                let v: SeriesCollectionView = new SeriesCollectionView();
                //series_collection_id, series_label and value_label are supposed to be the same for all the data
                v.series_collection_id = <ARTResource>d.bindingsList[0][CustomViewVariables.series_collection_id];
                v.series_label = d.bindingsList[0][CustomViewVariables.series_label].getShow();
                v.value_label = d.bindingsList[0][CustomViewVariables.value_label].getShow();
                d.bindingsList.forEach(b => {
                    let seriesName = b[CustomViewVariables.series_name];
                    let data = {
                        name: <ARTResource>b[CustomViewVariables.name],
                        value:  <ARTLiteral>b[CustomViewVariables.value]
                    };
                    let series = v.series.find(s => s.series_name.equals(seriesName));
                    if (series) {
                        series.data.push(data)
                    } else {
                        v.series.push({
                            series_name: seriesName,
                            data: [data]
                        })
                    }
                });
                view = v;
            }
            this.customViews.push(view);
        })
    }

    private initActionsStatus() {
    }

    /**
     * METHODS
     */


    /**
     * Events forwarding
     */

    onUpdate() {
        this.update.emit();
    }
    onDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);
    }

}