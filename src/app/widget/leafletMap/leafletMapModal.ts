import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UIUtils } from "src/app/utils/UIUtils";
import { GeoPoint, PoinChangedEvent } from "./leafletMapComponent";

@Component({
    selector: "leaflet-map-modal",
    templateUrl: "./leafletMapModal.html",
})
export class LeafletMapModal {
    @Input() title: string;
    @Input() edit: boolean;
    
    @Input() point: GeoPoint;
    @Input() route: GeoPoint[];
    @Input() area: GeoPoint[];

    //to keep the input values untouched in case of cancel when edit
    mapPoint: GeoPoint;
    mapRoute: GeoPoint[];
    mapArea: GeoPoint[];

    viewInitialized: boolean;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngOnInit() {
        if (this.point) {
            this.mapPoint = {
                location: this.point.location, 
                lat: this.point.lat,
                lng: this.point.lng
            };
        }
        if (this.route) {
            this.mapRoute = this.route.map(p => {
                return { location: p.location, lat: p.lat, lng: p.lng }
            })
        }
        if (this.area) {
            this.mapArea = this.area.map(p => {
                return { location: p.location, lat: p.lat, lng: p.lng }
            })
        }
        
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
        /**
         * The following is necessary in order to overcome issues with leaflet map.
         * When map is initialized, it needs to know the size of its parent element in order to 
         * compute the size of the map canvas. So, this boolean is used in order to initialize
         * the map component only once the dialog view is initialized and it is full screen
         */
        setTimeout(() => {
            this.viewInitialized = true;
        });
    }

    onPointChanged(point: PoinChangedEvent) {
        this.mapPoint = point.new;
    }

    onRoutePointChanged(event: PoinChangedEvent) {
        console.log("event", event);
        if (this.mapRoute) {
            let idx = this.mapRoute.findIndex(p => p.location.equals(event.old.location));
            this.mapRoute[idx] = event.new;
        } else if (this.mapArea) {
            let idx = this.mapArea.findIndex(p => p.location.equals(event.old.location));
            this.mapArea[idx] = event.new;
        }
    }

    ok() {
        if (this.point) {
            this.activeModal.close(this.mapPoint);
        } else if (this.route) {
            this.activeModal.close(this.mapRoute);
        } else {
            this.activeModal.close(this.mapArea);
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}