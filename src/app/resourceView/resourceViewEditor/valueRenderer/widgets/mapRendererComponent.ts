import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable } from "rxjs";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AreaWidget, MultiPointWidget, PointWidget, RouteWidget, WidgetDataBinding } from "src/app/models/VisualizationWidgets";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { GeoPoint } from "src/app/widget/leafletMap/leafletMapComponent";
import { LeafletMapModal } from "src/app/widget/leafletMap/leafletMapModal";
import { ModalOptions, Translation } from "src/app/widget/modal/Modals";
import { AbstractWidgetComponent } from "./abstractWidgetRenderer";

@Component({
    selector: "map-renderer",
    templateUrl: "./mapRendererComponent.html",
    host: { class: "hbox" },
    styles: [`
        :host {
            width: 100%;
        }
    `]
})
export class MapRendererComponent extends AbstractWidgetComponent {

    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;

    @Output() update = new EventEmitter();

    //input data needs converted in point or set of points
    point: GeoPoint; //a point to be represented (with a marker) on the map
    route: GeoPoint[]; //a set of points to be represented (with a polyline) on the map
    area: GeoPoint[];

    constructor(private visualizationWidgetsService: VisualizationWidgetsServices, private modalService: NgbModal, private translateService: TranslateService) {
        super()
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['widget']) {
            this.processInput();
        }
    }

    processInput() {
        /**
         * here I need to detect if I need to draw a point or a polyline (route/area)
         * the fact that the data types are compliant with the map widget is already granted from the parent component
         */
        if (this.widget instanceof PointWidget) {
            this.point = {
                location: this.widget.location, 
                lat: Number.parseFloat(this.widget.latitude.getShow()), 
                lng: Number.parseFloat(this.widget.longitude.getShow())
            }
        } else if (this.widget instanceof RouteWidget) {
            this.route = this.widget.locations.map(l => {
                return { 
                    location: l.location, 
                    lat: Number.parseFloat(l.latitude.getShow()), 
                    lng: Number.parseFloat(l.longitude.getShow())
                } 
            });
        } else if (this.widget instanceof AreaWidget) {
            this.area = this.widget.locations.map(l => {
                return { 
                    location: l.location, 
                    lat: Number.parseFloat(l.latitude.getShow()), 
                    lng: Number.parseFloat(l.longitude.getShow())
                } 
            });
        }
    }

    edit() {
        if (this.widget instanceof PointWidget) {
            let w = <PointWidget>this.widget;
            this.openMapModal({ key: "Edit point"}).then(
                (point: GeoPoint) => {
                    w.latitude.setValue(point.lat+"");
                    w.longitude.setValue(point.lng+"");
                    let bindingsMap = new Map();
                    bindingsMap.set(WidgetDataBinding.location, w.location);
                    bindingsMap.set(WidgetDataBinding.latitude, w.latitude);
                    bindingsMap.set(WidgetDataBinding.longitude, w.longitude);
                    this.visualizationWidgetsService.updateWidgetData(this.subject, this.predicate, bindingsMap).subscribe(
                        () => {
                            this.update.emit();
                        }
                    )
                },
                () => {}
            );
        } else { //area or route
            let title: string = this.area ? "Edit area" : "Edit route";
            this.openMapModal({ key: title}).then(
                (points: GeoPoint[]) => {
                    this.updateMultiplePoints(points);
                },
                () => {}
            );
        }
    }

    private updateMultiplePoints(newPoints: GeoPoint[]) {
        let w: MultiPointWidget = <MultiPointWidget>this.widget;

        let updatedLocations = []; //collect
        w.locations.forEach(l => {
            let point = newPoints.find(p => p.location.equals(l.location));
            if (point.lat != Number(l.latitude.getShow()) || point.lng != Number(l.longitude.getShow())) {
                l.latitude.setValue(point.lat+"");
                l.longitude.setValue(point.lng+"");
                updatedLocations.push(l);
            }
        })

        let updateFn: Observable<void>[] = [];
        for (let l of updatedLocations) {
            let bindingsMap = new Map();
            bindingsMap.set(WidgetDataBinding.route_id, w.routeId);
            bindingsMap.set(WidgetDataBinding.location, l.location);
            bindingsMap.set(WidgetDataBinding.latitude, l.latitude);
            bindingsMap.set(WidgetDataBinding.longitude, l.longitude);
            updateFn.push(this.visualizationWidgetsService.updateWidgetData(this.subject, this.predicate, bindingsMap));
        }
        if (updateFn.length > 0) {
            forkJoin(updateFn).subscribe(() => {
                this.update.emit();
            })
        }
    }

    private openMapModal(title: Translation): Promise<GeoPoint|GeoPoint[]> {
        const modalRef: NgbModalRef = this.modalService.open(LeafletMapModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = this.translateService.instant(title.key);
        modalRef.componentInstance.edit = true;
		modalRef.componentInstance.point = this.point;
        modalRef.componentInstance.route = this.route;
        modalRef.componentInstance.area = this.area;
        return modalRef.result;
    }


    onMapDoubleClick() {
        if (this.widget instanceof PointWidget) {
            this.onDoubleClick(this.widget.location);    
        } else if (this.widget instanceof MultiPointWidget) {
            this.onDoubleClick(this.widget.routeId);
        }
    }

}