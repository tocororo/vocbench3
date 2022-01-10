import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import * as L from "leaflet";

@Component({
    selector: "open-street-map",
    templateUrl: "./openStreetMapComponent.html",
})
export class OpenStreeMapComponent {
    @Input() lat: number;
    @Input() lng: number;

    @ViewChild('mapEl', { static: false }) mapEl: ElementRef;

    private map: L.Map;
    private centerMap: L.LatLngExpression;

    constructor() { }

    ngOnInit() {
        this.fixLeafletMarker();
        this.centerMap = [this.lat, this.lng]
    }

    ngAfterViewInit(): void {
        this.initMap();
    }

    private initMap(): void {
        // let mapboxUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
        // let streetLayer: L.TileLayer = L.tileLayer(mapboxUrl, {
        //     id: 'mapbox/streets-v11',
        //     tileSize: 512,
        //     zoomOffset: -1
        // })

        // let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        // let attrib = "Map data (c)OpenStreetMap contributors";

        // let tileUrl = "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png";
        // let attrib = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

        let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
        let attrib ='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
        
        let omsLayer = new L.TileLayer(tileUrl, {minZoom: 4, maxZoom: 16, attribution: attrib});

        this.map = L.map(this.mapEl.nativeElement, {
            center: this.centerMap,
            doubleClickZoom: false,
            // scrollWheelZoom: false,
            zoom: 11,
            zoomControl: false,
            layers: [omsLayer]
        });

        let marker = L.marker(this.centerMap);
        marker.addTo(this.map)
    }

    private fixLeafletMarker() {
        //https://stackoverflow.com/questions/41144319/leaflet-marker-not-found-production-env
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