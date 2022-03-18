import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { AbstractView, AdvSingleValueView, AreaView, BindingMapping, CustomViewCategory, CustomViewModel, CustomViewRenderedValue, CustomViewVariables, DynamicVectorView, PointView, PredicateCustomView, PropertyChainView, RouteView, SeriesCollectionView, SeriesView, SparqlBasedValueDTO, StaticVectorView, UpdateMode } from "src/app/models/CustomViews";
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

    category: CustomViewCategory;

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

        if (this.predicateCustomView.cvData.model == CustomViewModel.point) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: PointView = new PointView(d.resource);
                v.readonly = descr.updateMode == UpdateMode.none;
                let pointDescr: BindingMapping = descr.bindingsList[0]; //for sure there is only one BingingMapping which describes the only point
                v.location = <ARTResource>pointDescr[CustomViewVariables.location];
                v.latitude = <ARTLiteral>pointDescr[CustomViewVariables.latitude];
                v.longitude = <ARTLiteral>pointDescr[CustomViewVariables.longitude];
                this.customViews.push(v);
            })
        } else if (this.predicateCustomView.cvData.model == CustomViewModel.area) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: AreaView = new AreaView(d.resource);
                v.readonly = descr.updateMode == UpdateMode.none;
                v.routeId = <ARTResource>descr.bindingsList[0][CustomViewVariables.route_id]; //by construction route ID is the same for each record
                descr.bindingsList.forEach(b => {
                    v.locations.push({
                        location: <ARTResource>b[CustomViewVariables.location],
                        latitude: <ARTLiteral>b[CustomViewVariables.latitude],
                        longitude: <ARTLiteral>b[CustomViewVariables.longitude]
                    })
                });
                v.readonly = descr.updateMode == UpdateMode.none;
                this.customViews.push(v);
            })
        } else if (this.predicateCustomView.cvData.model == CustomViewModel.route) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: RouteView = new RouteView(d.resource);
                v.readonly = descr.updateMode == UpdateMode.none;
                v.routeId = <ARTResource>descr.bindingsList[0][CustomViewVariables.route_id]; //by construction route ID is the same for each record
                descr.bindingsList.forEach(b => {
                    v.locations.push({
                        location: <ARTResource>b[CustomViewVariables.location],
                        latitude: <ARTLiteral>b[CustomViewVariables.latitude],
                        longitude: <ARTLiteral>b[CustomViewVariables.longitude]
                    })
                });
                this.customViews.push(v);
            })
        } else if (this.predicateCustomView.cvData.model == CustomViewModel.series) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: SeriesView = new SeriesView(d.resource);
                v.readonly = descr.updateMode == UpdateMode.none;
                //series_id, series_label and value_label are supposed to be the same for all the data
                v.series_id = <ARTResource>descr.bindingsList[0][CustomViewVariables.series_id];
                v.series_label = descr.bindingsList[0][CustomViewVariables.series_label].getShow();
                v.value_label = descr.bindingsList[0][CustomViewVariables.value_label].getShow();
                descr.bindingsList.forEach(b => {
                    v.data.push({
                        name: <ARTResource>b[CustomViewVariables.name],
                        value: <ARTLiteral>b[CustomViewVariables.value]
                    })
                });
                this.customViews.push(v);
            })
        } else if (this.predicateCustomView.cvData.model == CustomViewModel.series_collection) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: SparqlBasedValueDTO = <SparqlBasedValueDTO>d.description;
                let v: SeriesCollectionView = new SeriesCollectionView(d.resource);
                v.readonly = descr.updateMode == UpdateMode.none;
                //series_collection_id, series_label and value_label are supposed to be the same for all the data
                v.series_collection_id = <ARTResource>descr.bindingsList[0][CustomViewVariables.series_collection_id];
                v.series_label = descr.bindingsList[0][CustomViewVariables.series_label].getShow();
                v.value_label = descr.bindingsList[0][CustomViewVariables.value_label].getShow();
                descr.bindingsList.forEach(b => {
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
                this.customViews.push(v);
            })
        } else if (this.predicateCustomView.cvData.model == CustomViewModel.property_chain) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: CustomViewRenderedValue = <CustomViewRenderedValue>d.description;
                let v: PropertyChainView = new PropertyChainView(d.resource);
                v.value = descr;
                this.customViews.push(v);
            });
        } else if (this.predicateCustomView.cvData.model == CustomViewModel.adv_single_value) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: CustomViewRenderedValue = <CustomViewRenderedValue>d.description;
                let v: AdvSingleValueView = new AdvSingleValueView(d.resource);
                v.value = descr;
                this.customViews.push(v);
            });
        } else if (this.predicateCustomView.cvData.model == CustomViewModel.static_vector) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: CustomViewRenderedValue[] = <CustomViewRenderedValue[]>d.description;
                let v: StaticVectorView = new StaticVectorView(d.resource);
                v.values = descr;
                this.customViews.push(v);
            });
        } else if (this.predicateCustomView.cvData.model == CustomViewModel.dynamic_vector) {
            this.predicateCustomView.cvData.data.forEach(d => {
                let descr: CustomViewRenderedValue[] = <CustomViewRenderedValue[]>d.description;
                let v: DynamicVectorView = new DynamicVectorView(d.resource);
                v.values = descr;
                this.customViews.push(v);
            });
        }

        let v = this.customViews[0]; //for the same predicate, model and category are the same for each cv, so it's ok to take just the first
        this.category = v.category;
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