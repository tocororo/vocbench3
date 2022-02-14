import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { DataTypeBindingsMap, WidgetDataBinding, WidgetDataType } from "src/app/models/VisualizationWidgets";
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
            height: 200px;
        }
    `]
})
export class MapRendererComponent extends AbstractWidgetComponent {

    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() object: ARTResource;

    @Output() update = new EventEmitter();
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    //input data needs to be converted in point or trace
    point: GeoPoint; //a point to be represented (with a marker) on the map
    trace: GeoPoint[]; //a trace (set of points) to be represented (with a polyline) on the map

    constructor(private visualizationWidgetsService: VisualizationWidgetsServices, private modalService: NgbModal, private translateService: TranslateService) {
        super()
    }

    ngOnInit() {
        this.processInput();
    }

    processInput() {
        /**
         * here I need to detect if I need to draw a point or a polyline (route/area)
         * the fact that the data types are compliant with the map widget is already granted from the parent component
         */
        let dataTypes: WidgetDataType[] = DataTypeBindingsMap.getCompliantDataTypes(this.data[0].getBindings());
        if (dataTypes.includes(WidgetDataType.point)) {
            let latNode = this.data[0].getValue(WidgetDataBinding.latitude);
            let longNode = this.data[0].getValue(WidgetDataBinding.longitude);
            this.point = { lat: Number.parseFloat(latNode.getShow()), long: Number.parseFloat(longNode.getShow()) }
        } else if (dataTypes.includes(WidgetDataType.area)) {
            // this.tracePolyline = this.trace ? L.polyline(this.trace.map(p => new L.LatLng(p.latitude, p.longitude))) : null;
            // this.tracePolyline.addTo(this.map);
        }
    }

    edit() {
        this.openMapModal({ key: "Choose a point"}).then(
            (point: GeoPoint) => {
                this.visualizationWidgetsService.updateMapPoint(this.subject, this.predicate, this.object, point.lat, point.long).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => {}
        )
    }

    private openMapModal(title: Translation) {
        const modalRef: NgbModalRef = this.modalService.open(LeafletMapModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = this.translateService.instant(title.key);
        modalRef.componentInstance.selection = true;
		modalRef.componentInstance.point = this.point;
        return modalRef.result;
    }

}