import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import * as L from "leaflet";
import { ARTResource } from "src/app/models/ARTResources";

@Component({
    selector: "leaflet-map",
    templateUrl: "./leafletMapComponent.html",
    styles: [`
        :host {
            width: 100%;
            height: 100%;
        }
    `]
})
export class LeafletMapComponent {
    @Input() edit: boolean = false; //tells if the component is working in edit mode, namely if it allows the selection of a point (with a marker)

    @Input() point: GeoPoint; //a point to be represented (with a marker) on the map
    @Input() route: GeoPoint[]; //a trace (set of points) to be represented (with a polyline) on the map
    @Input() area: GeoPoint[];

    @Output() pointChanged: EventEmitter<PoinChangedEvent> = new EventEmitter();
    @Output() routePointChanged: EventEmitter<PoinChangedEvent> = new EventEmitter();

    @ViewChild('mapEl', { static: false }) mapEl: ElementRef;

    private map: L.Map;
    private mapReady: boolean; //tells that the map layer is ready, so prevent to add element if not

    private marker: L.Marker;
    private polyline: L.Polyline;
    private polygon: L.Polygon;


    ngOnInit() {
        this.fixLeafletMarker();
    }

    ngAfterViewInit(): void {
        this.initMap();
        this.mapReady = true;
        this.initGraphicElements();
    }

    ngOnChanges(changes: SimpleChanges) {
        if ((changes['point'] || changes['trace'] || changes['area']) && this.mapReady) {
            this.initGraphicElements();
        }
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

    private initGraphicElements() {
        //once the input has been converted, init marker or polyline
        if (this.point) {
            this.drawMarker();
        } else if (this.route) {
            this.drawPolyline();
        } else if (this.area) {
            this.drawPolygon();
        }
    }

    private drawMarker() {
        if (this.marker) {
            this.marker.remove();
        }

        let pointLatLng: VbLatLng = new VbLatLng(this.point.location, this.point.lat, this.point.lng);
        this.marker = L.marker(pointLatLng);
        this.marker.addTo(this.map)

        let popup: L.Popup = L.popup({ closeButton: false });
        popup.setContent(
            "<table><tbody>" +
            "<tr><td><b>Lat:</b></td><td>" + pointLatLng.lat + "</td></tr>" +
            "<tr><td><b>Long:</b></td><td>" + pointLatLng.lng + "</td></tr>" +
            "</tbody></table>"
        );
        this.marker.bindPopup(popup).openPopup();

        //center map
        this.map.setView(pointLatLng);

        //if it works in edit mode, enable the click handler
        if (this.edit) {
            this.map.on('click', (e: L.LeafletMouseEvent) => {
                this.onClickListener(e);
            })
        }
    }


    private drawPolyline() {
        if (this.polyline) {
            this.polyline.remove();
        }

        let polylinePoints = this.route.map(p => new VbLatLng(p.location, p.lat, p.lng));

        this.polyline = L.polyline(polylinePoints);
        this.polyline.bindPopup("Route");
        this.polyline.addTo(this.map);
        this.polyline.on('popupopen', function (e: L.PopupEvent) {
            let popup = e.popup;
            popup.setContent(
                "<table><tbody>" +
                "<tr><td><b>Lat:</b></td><td>" + popup.getLatLng().lat + "</td></tr>" +
                "<tr><td><b>Long:</b></td><td>" + popup.getLatLng().lng + "</td></tr>" +
                "</tbody></table>"
            )
        });

        //center map
        this.map.fitBounds(this.polyline.getBounds(), { padding: [10, 10] })

        if (this.edit) {
            this.registerPointsDragListener(this.polyline);
        }
    }

    private drawPolygon() {
        if (this.polygon) {
            this.polygon.remove();
        }

        let polygonPoints = this.area.map(p => new VbLatLng(p.location, p.lat, p.lng));

        this.polygon = L.polygon(polygonPoints, { color: 'blue' });
        this.polygon.bindPopup("Route");
        this.polygon.addTo(this.map);
        this.polygon.on('popupopen', function (e: L.PopupEvent) {
            let popup = e.popup;
            popup.setContent(
                "<table><tbody>" +
                "<tr><td><b>Lat:</b></td><td>" + popup.getLatLng().lat + "</td></tr>" +
                "<tr><td><b>Long:</b></td><td>" + popup.getLatLng().lng + "</td></tr>" +
                "</tbody></table>"
            )
        });

        //center map
        this.map.fitBounds(this.polygon.getBounds(), { padding: [10, 10] })

        if (this.edit) {
            this.registerPointsDragListener(this.polygon);
        }
    }


    private draggingPoint: VbLatLng; //keep trace of the point linked to the dragging marker
    private draggingPointInitialPos: VbLatLng; //store the initial position of the point dragged
    private registerPointsDragListener(polygonOrPolyline: L.Polygon | L.Polyline) {
        let points: VbLatLng[]; 
        if (polygonOrPolyline instanceof L.Polygon) {
            //in case of polygon, get the first element since the return value of getLatLngs() is an array of one element (see https://github.com/Leaflet/Leaflet/issues/5212)
            points = <VbLatLng[]>polygonOrPolyline.getLatLngs()[0];
        } else {
            points = <VbLatLng[]>polygonOrPolyline.getLatLngs();
        }
        //add a draggable marker to each point of the track
        let pathMarkers: L.Marker[] = [];
        points.forEach(p => {
            let m: L.Marker = new L.Marker(p, {draggable: true});
            m['location'] = p.location.toNT(); //add this custom attribute. so that in dragstart I can identify the GeoPoint related to the marker
            this.addMarkerPopup(m);
            m.addTo(this.map);
            pathMarkers.push(m);
        })
        //register drag handler for each marker
        pathMarkers.forEach(m => {
            m.on('dragstart', () => {
                /* 
                when user starts dragging, store:
                - the point associated to the dragging marker, so that its coords will be updated following the coords of the marker
                - the same point in a different variable, so that when drag ends, I can emit an update event reporting both the old and the new points
                Note: in order to identify the point related to the marker, I use a custom attribute 'location' in the marker because:
                - I don't trust using lat and lng as reference since accidentally I couldn't distinguish two markers on the same position (remote but possible case)
                - I cannot get directly the location from the point returned in m.getLatLng(), since when the marker is dragged, the point returned from
                    getLatLng has no more location in it (probably leaflet re-creates the marker with the LatLng in it, so the location I put in VbLatLng get lost)
                */
                this.draggingPoint = points.find(p => p.location.toNT() == m['location']);
                this.draggingPointInitialPos = new VbLatLng(this.draggingPoint.location, this.draggingPoint.lat, this.draggingPoint.lng);
            })
            m.on('drag', () => {
                this.draggingPoint.lat = m.getLatLng().lat;
                this.draggingPoint.lng = m.getLatLng().lng;
                polygonOrPolyline.redraw(); //update the polyline/polygon with the new coords
            })
            m.on('dragend', () => {
                //when drag ends emit an event
                let oldPoint: GeoPoint = { location: this.draggingPointInitialPos.location, lat: this.draggingPointInitialPos.lat, lng: this.draggingPointInitialPos.lng };
                let newPoint: GeoPoint = { location: this.draggingPointInitialPos.location, lat: this.draggingPoint.lat, lng: this.draggingPoint.lng };
                this.routePointChanged.emit({ old: oldPoint, new: newPoint });
            })
        })
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

        this.addMarkerPopup(this.marker);
        this.marker.openPopup();

        this.pointChanged.emit({ 
            old: this.point, 
            new : { location: this.point.location, lat: e.latlng.lat, lng: e.latlng.lng } }
        );
    };

    private addMarkerPopup(marker: L.Marker) {
        let popup: L.Popup = L.popup({ closeButton: false });
        popup.setContent(
            "<table><tbody>" +
            "<tr><td><b>Lat:</b></td><td>" + marker.getLatLng().lat + "</td></tr>" +
            "<tr><td><b>Long:</b></td><td>" + marker.getLatLng().lng + "</td></tr>" +
            "</tbody></table>"
        );
        marker.bindPopup(popup);
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

export interface GeoPoint {
    location: ARTResource;
    lat: number;
    lng: number;
}

export interface PoinChangedEvent {
    old: GeoPoint;
    new: GeoPoint;
}

class VbLatLng extends L.LatLng {
    location: ARTResource;

    constructor(location: ARTResource, lat: number, lng: number) {
        super(lat, lng);
        this.location = location;
    }
}