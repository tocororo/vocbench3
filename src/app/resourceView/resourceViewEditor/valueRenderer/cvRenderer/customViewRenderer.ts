import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { AbstractView, AdvSingleValueView, AreaView, BindingMapping, CustomViewCategory, CustomViewData, CustomViewModel, CustomViewRenderedValue, CustomViewVariables, DynamicVectorView, PointView, PropertyChainView, RouteView, SeriesCollectionView, SeriesView, SparqlBasedValueDTO, StaticVectorView, UpdateMode } from "src/app/models/CustomViews";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";

@Component({
    selector: "custom-views-renderer",
    templateUrl: "./customViewRenderer.html",
    styles: [`
        :host {
            display: block;
        }
    `]

})
export class CustomViewsRenderer {

    /**
     * INPUTS / OUTPUTS
     */

    @Input('cvData') customViewData: CustomViewData;
    @Input() subject: ARTResource; //resource described
    @Input() predicate: ARTURIResource;
    @Input() readonly: boolean;
    @Input() rendering: boolean;
    @Input() partition: ResViewPartition;
    @Output() update: EventEmitter<void> = new EventEmitter();
    @Output() delete: EventEmitter<ARTNode> = new EventEmitter();
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    /**
     * ATTRIBUTES
     */

    customViews: AbstractView[];

    category: CustomViewCategory;

    constructor() { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['subject'] || changes['readonly']) {
            this.initActionsStatus();
        }
        if (changes['customViewData']) {
            // this.predicate = this.predicateCustomView.predicate;
            this.initCustomViewData();
        }
    }

    private initCustomViewData() {
        //convert the data to a proper view structure according the model type
        this.customViews = [];

        if (this.customViewData.model == CustomViewModel.point) {
            this.customViewData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: PointView = new PointView(d.resource, this.customViewData.defaultView);
                v.allowEdit = descr.updateMode != UpdateMode.none;
                let pointDescr: BindingMapping = descr.bindingsList[0]; //for sure there is only one BingingMapping which describes the only point
                v.location = <ARTResource>pointDescr[CustomViewVariables.location];
                v.latitude = <ARTLiteral>pointDescr[CustomViewVariables.latitude];
                v.longitude = <ARTLiteral>pointDescr[CustomViewVariables.longitude];
                this.customViews.push(v);
            });
        } else if (this.customViewData.model == CustomViewModel.area) {
            this.customViewData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: AreaView = new AreaView(d.resource, this.customViewData.defaultView);
                v.allowEdit = descr.updateMode != UpdateMode.none;
                v.routeId = <ARTResource>descr.bindingsList[0][CustomViewVariables.route_id]; //by construction route ID is the same for each record
                descr.bindingsList.forEach(b => {
                    v.locations.push({
                        location: <ARTResource>b[CustomViewVariables.location],
                        latitude: <ARTLiteral>b[CustomViewVariables.latitude],
                        longitude: <ARTLiteral>b[CustomViewVariables.longitude]
                    });
                });
                this.customViews.push(v);
            });
        } else if (this.customViewData.model == CustomViewModel.route) {
            this.customViewData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: RouteView = new RouteView(d.resource, this.customViewData.defaultView);
                v.allowEdit = descr.updateMode != UpdateMode.none;
                v.routeId = <ARTResource>descr.bindingsList[0][CustomViewVariables.route_id]; //by construction route ID is the same for each record
                descr.bindingsList.forEach(b => {
                    v.locations.push({
                        location: <ARTResource>b[CustomViewVariables.location],
                        latitude: <ARTLiteral>b[CustomViewVariables.latitude],
                        longitude: <ARTLiteral>b[CustomViewVariables.longitude]
                    });
                });
                this.customViews.push(v);
            });
        } else if (this.customViewData.model == CustomViewModel.series) {
            this.customViewData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: SeriesView = new SeriesView(d.resource, this.customViewData.defaultView);
                v.allowEdit = descr.updateMode != UpdateMode.none;
                //series_id, series_label and value_label are supposed to be the same for all the data
                v.series_id = <ARTResource>descr.bindingsList[0][CustomViewVariables.series_id];
                if (descr.bindingsList[0][CustomViewVariables.series_label] != null) {
                    v.series_label = descr.bindingsList[0][CustomViewVariables.series_label].getShow();
                }
                if (descr.bindingsList[0][CustomViewVariables.value_label] != null) {
                    v.value_label = descr.bindingsList[0][CustomViewVariables.value_label].getShow();
                }
                descr.bindingsList.forEach(b => {
                    v.data.push({
                        name: <ARTResource>b[CustomViewVariables.name],
                        value: <ARTLiteral>b[CustomViewVariables.value]
                    });
                });
                this.customViews.push(v);
            });
        } else if (this.customViewData.model == CustomViewModel.series_collection) {
            this.customViewData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: SeriesCollectionView = new SeriesCollectionView(d.resource, this.customViewData.defaultView);
                v.allowEdit = descr.updateMode != UpdateMode.none;
                //series_collection_id, series_label and value_label are supposed to be the same for all the data
                v.series_collection_id = <ARTResource>descr.bindingsList[0][CustomViewVariables.series_collection_id];
                if (descr.bindingsList[0][CustomViewVariables.series_label] != null) {
                    v.series_label = descr.bindingsList[0][CustomViewVariables.series_label].getShow();
                }
                if (descr.bindingsList[0][CustomViewVariables.value_label] != null) {
                    v.value_label = descr.bindingsList[0][CustomViewVariables.value_label].getShow();
                }
                descr.bindingsList.forEach(b => {
                    let seriesName = b[CustomViewVariables.series_name];
                    let data = {
                        name: <ARTResource>b[CustomViewVariables.name],
                        value: <ARTLiteral>b[CustomViewVariables.value]
                    };
                    let series = v.series.find(s => s.series_name.equals(seriesName));
                    if (series) {
                        series.data.push(data);
                    } else {
                        v.series.push({
                            series_name: seriesName,
                            data: [data]
                        });
                    }
                });
                this.customViews.push(v);
            });
        } else if (this.customViewData.model == CustomViewModel.property_chain) {
            this.customViewData.data.forEach(d => {
                let descr: CustomViewRenderedValue = <CustomViewRenderedValue>d.description;
                let v: PropertyChainView = new PropertyChainView(d.resource, this.customViewData.defaultView);
                v.value = descr;
                this.customViews.push(v);
            });
        } else if (this.customViewData.model == CustomViewModel.adv_single_value) {
            this.customViewData.data.forEach(d => {
                let descr: CustomViewRenderedValue = <CustomViewRenderedValue>d.description;
                let v: AdvSingleValueView = new AdvSingleValueView(d.resource, this.customViewData.defaultView);
                v.value = descr;
                this.customViews.push(v);
            });
        } else if (this.customViewData.model == CustomViewModel.static_vector) {
            this.customViewData.data.forEach(d => {
                let descr: CustomViewRenderedValue[] = <CustomViewRenderedValue[]>d.description;
                let v: StaticVectorView = new StaticVectorView(d.resource, this.customViewData.defaultView);
                v.values = descr;
                this.customViews.push(v);
            });
        } else if (this.customViewData.model == CustomViewModel.dynamic_vector) {
            this.customViewData.data.forEach(d => {
                let descr: CustomViewRenderedValue[] = <CustomViewRenderedValue[]>d.description;
                let v: DynamicVectorView = new DynamicVectorView(d.resource, this.customViewData.defaultView);
                v.values = descr;
                this.customViews.push(v);
            });
        }

        //for the same predicate, model and category are the same for each cv, so it's ok to take just the first
        this.category = this.customViews[0].category;
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
    onDelete(res: ARTNode) {
        this.delete.emit(res);
    }
    onDblClick(obj: ARTResource) {
        this.dblclickObj.emit(obj);
    }

}