import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import * as L from "leaflet";
import { Point, Trace } from "./GeoData";

@Component({
    selector: "open-street-map",
    templateUrl: "./openStreetMapComponent.html",
    styles: [`
        :host {
            width: 100%;
            height: 200px;
        }
    `]
})
export class OpenStreeMapComponent {
    @Input() lat: number;
    @Input() lng: number;

    @Input() point: Point;
    @Input() trace: Point[];

    @ViewChild('mapEl', { static: false }) mapEl: ElementRef;

    private map: L.Map;

    private tracePolyline: L.Polyline; //trace converted in leaflet format
    private pointLatLng: L.LatLngExpression; //point converter in leaflet format


    constructor() { }

    ngOnInit() {
        this.fixLeafletMarker();
        this.processInput();
    }

    ngAfterViewInit(): void {
        this.initMap();

        this.addMarker();
        this.addPolyline();
        this.setCenter();
    }

    private processInput() {
        this.pointLatLng = this.point ? new L.LatLng(this.point.latitude, this.point.longitude) : null;
        this.tracePolyline = this.trace ? L.polyline(this.trace.map(p => new L.LatLng(p.latitude, p.longitude))) : null;
    }

    private initMap(): void {
        let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
        let attrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

        let omsLayer = new L.TileLayer(tileUrl, { minZoom: 4, maxZoom: 16, attribution: attrib });

        this.map = L.map(this.mapEl.nativeElement, {
            doubleClickZoom: false,
            zoom: 11,
            zoomControl: false,
            layers: [omsLayer]
        });
    }

    private addMarker() {
        if (this.point) {
            let marker = L.marker(this.pointLatLng);
            marker.addTo(this.map)

            let popup: L.Popup = L.popup({ offset: L.point(0, -20) });
            popup.setContent("Hello popup");
            marker.bindPopup(popup);

            let tooltip: L.Tooltip = L.tooltip({ direction: 'top' });
            tooltip.setContent("Hello tooltip")


            marker.bindTooltip(tooltip).openTooltip();

            // let tooltipPopup: L.Popup = L.popup({ offset: L.point(0, -20) });
            // tooltipPopup.setContent("Hello");
            // marker.on('mouseover', (e: L.LeafletEvent) => {
            //     tooltipPopup.setLatLng(e.target.getLatLng());
            //     tooltipPopup.openOn(this.map);
            // }
            // );
            // marker.on('mouseout', (e: L.LeafletEvent) => {
            //     this.map.closePopup(tooltipPopup);
            // });
        }
    }

    private addPolyline() {
        if (this.trace) {
            this.tracePolyline.addTo(this.map);
        }
    }

    private setCenter() {
        if (this.tracePolyline) {
            this.map.fitBounds(this.tracePolyline.getBounds())
        } else {
            this.map.setView(this.pointLatLng);
        }
    }


    /**
     * Solves issues with markers
     * https://stackoverflow.com/questions/41144319/leaflet-marker-not-found-production-env
     */
    private fixLeafletMarker() {
        const iconRetinaUrl = 'assets/images/leaflet/marker-icon-2x.png';
        const iconUrl = 'assets/images/leaflet/marker-icon.png';
        const shadowUrl = 'assets/images/leaflet/marker-shadow.png';
        const iconDefault = L.icon({
            iconRetinaUrl,
            iconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = iconDefault;

    }

}