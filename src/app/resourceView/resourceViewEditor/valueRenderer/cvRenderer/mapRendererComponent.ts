import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable } from "rxjs";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AbstractMultiPointView, AreaView, CustomViewVariables, PointView, RouteView } from "src/app/models/CustomViews";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { GeoPoint } from "src/app/widget/leafletMap/leafletMapComponent";
import { LeafletMapModal } from "src/app/widget/leafletMap/leafletMapModal";
import { ModalOptions, Translation } from "src/app/widget/modal/Modals";
import { AbstractViewRendererComponent } from "./abstractViewRenderer";

@Component({
    selector: "map-renderer",
    templateUrl: "./mapRendererComponent.html",
    host: { class: "hbox" },
    styles: [`
        :host {
            height: 300px;
            width: 100%;
        }
    `]
})
export class MapRendererComponent extends AbstractViewRendererComponent {

    //input data needs converted in point or set of points
    point: GeoPoint; //a point to be represented (with a marker) on the map
    route: GeoPoint[]; //a set of points to be represented (with a polyline) on the map
    area: GeoPoint[];

    constructor(private cvService: CustomViewsServices, private modalService: NgbModal, private translateService: TranslateService) {
        super()
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['view']) {
            this.processInput();
        }
    }

    processInput() {
        /**
         * here I need to detect if I need to draw a point or a polyline (route/area)
         * the fact that the data types are compliant with the map view is already granted from the parent component
         */
        if (this.view instanceof PointView) {
            this.point = {
                location: this.view.location, 
                lat: Number.parseFloat(this.view.latitude.getShow()), 
                lng: Number.parseFloat(this.view.longitude.getShow())
            }
        } else if (this.view instanceof RouteView) {
            this.route = this.view.locations.map(l => {
                return { 
                    location: l.location, 
                    lat: Number.parseFloat(l.latitude.getShow()), 
                    lng: Number.parseFloat(l.longitude.getShow())
                } 
            });
        } else if (this.view instanceof AreaView) {
            this.area = this.view.locations.map(l => {
                return { 
                    location: l.location, 
                    lat: Number.parseFloat(l.latitude.getShow()), 
                    lng: Number.parseFloat(l.longitude.getShow())
                } 
            });
        }
    }

    edit() {
        if (this.view instanceof PointView) {
            let w = <PointView>this.view;
            this.openMapModal({ key: "Edit point"}).then(
                (point: GeoPoint) => {
                    w.latitude.setValue(point.lat+"");
                    w.longitude.setValue(point.lng+"");
                    let bindingsMap = new Map();
                    bindingsMap.set(CustomViewVariables.location, w.location);
                    bindingsMap.set(CustomViewVariables.latitude, w.latitude);
                    bindingsMap.set(CustomViewVariables.longitude, w.longitude);
                    this.cvService.updateSparqlBasedData(this.subject, this.predicate, bindingsMap).subscribe(
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
        let w: AbstractMultiPointView = <AbstractMultiPointView>this.view;

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
            bindingsMap.set(CustomViewVariables.route_id, w.routeId);
            bindingsMap.set(CustomViewVariables.location, l.location);
            bindingsMap.set(CustomViewVariables.latitude, l.latitude);
            bindingsMap.set(CustomViewVariables.longitude, l.longitude);
            updateFn.push(this.cvService.updateSparqlBasedData(this.subject, this.predicate, bindingsMap));
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


}