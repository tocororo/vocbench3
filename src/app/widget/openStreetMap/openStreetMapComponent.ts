import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import * as L from "leaflet";

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
    @Input() selection: boolean = false; //tells if the component is working in selection mode, namely if it allows the selection of a point (with a marker)

    @Input() point: Point; //a point to be represented (with a marker) on the map
    @Input() trace: Point[]; //a trace (set of points) to be represented (with a polyline) on the map

    @ViewChild('mapEl', { static: false }) mapEl: ElementRef;

    private map: L.Map;

    private pointLatLng: L.LatLngLiteral; //point converter in leaflet format
    private tracePolyline: L.Polyline; //trace converted in leaflet format

    private marker: L.Marker;


    ngOnInit() {
        this.fixLeafletMarker();
    }

    ngAfterViewInit(): void {
        this.initMap();
        this.convertInputToLeaflet();

        //once the input has been converted, init marker or polyline
        if (this.pointLatLng) {
            this.drawMarker();
        } else if (this.tracePolyline) {
            this.drawPolyline();
        }

        //finally center the map
        this.centerMap();
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

        if (this.selection) { //if it works in selection mode, enable the click handler
            this.map.on('click', (e: L.LeafletMouseEvent) => {
                this.onClickListener(e);   
            })    
        }
    }

    /**
     * Convert the input data (point or trace) in Leaflet format (LatLngLiteral or Polyline)
     */
    private convertInputToLeaflet() {
        if (this.point) {
            this.pointLatLng = new L.LatLng(this.point.lat, this.point.long);
        } else if (this.trace) {
            this.tracePolyline = this.trace ? L.polyline(this.trace.map(p => new L.LatLng(p.lat, p.long))) : null;
        }
    }

    private drawMarker() {
        this.marker = L.marker(this.pointLatLng);
        this.marker.addTo(this.map)

        let popup: L.Popup = L.popup({ closeButton: false });
        popup.setContent(
            "<table><tbody>" + 
            "<tr><td><b>Lat:</b></td><td>" + this.pointLatLng.lat + "</td></tr>" +
            "<tr><td><b>Long:</b></td><td>" + this.pointLatLng.lng + "</td></tr>" +
            "</tbody></table>"
        );
        this.marker.bindPopup(popup).openPopup();

        // let tooltip: L.Tooltip = L.tooltip({ direction: 'top' });
        // tooltip.setContent("Hello tooltip")
        // this.marker.bindTooltip(tooltip).openTooltip();
    }

    private drawPolyline() {
        this.tracePolyline.addTo(this.map);
    }

    private centerMap() {
        if (this.tracePolyline) {
            this.map.fitBounds(this.tracePolyline.getBounds())
        } else {
            this.map.setView(this.pointLatLng);
        }
    }

    /**
     * Listener to click on map. Set a marker on the point clicked
     * @param e 
     */
    private onClickListener(e: L.LeafletMouseEvent) {
        //remove the previous marker (if any)
        if (this.marker) {
            this.marker.remove();
        }
        //add the new one
        this.marker = L.marker(e.latlng).addTo(this.map);
        let popup: L.Popup = L.popup({ closeButton: false });
        popup.setContent(
            "<table><tbody>" + 
            "<tr><td><b>Lat:</b></td><td>" + e.latlng.lat + "</td></tr>" +
            "<tr><td><b>Long:</b></td><td>" + e.latlng.lng + "</td></tr>" +
            "</tbody></table>"
        );
        this.marker.bindPopup(popup).openPopup();
    };

    

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

export interface Point {
    lat: number;
    long: number;
}