import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { WidgetDataBinding, WidgetDataType } from "src/app/models/VisualizationWidgets";
import { XmlSchema } from "src/app/models/Vocabulary";
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

    @Output() update = new EventEmitter();
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    //input data needs converted in point or set of points
    point: GeoPoint; //a point to be represented (with a marker) on the map
    route: GeoPoint[]; //a set of points to be represented (with a polyline) on the map
    area: GeoPoint[];

    constructor(private visualizationWidgetsService: VisualizationWidgetsServices, private modalService: NgbModal, private translateService: TranslateService) {
        super()
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            this.processInput();
        }
    }

    processInput() {
        /**
         * here I need to detect if I need to draw a point or a polyline (route/area)
         * the fact that the data types are compliant with the map widget is already granted from the parent component
         */
        if (this.data.type == WidgetDataType.point) {
            let locationDescr = this.data.bindingsList[0]; //for sure it's only a record
            let latNode: ARTNode = locationDescr[WidgetDataBinding.latitude];
            let longNode: ARTNode = locationDescr[WidgetDataBinding.longitude];
            this.point = {
                location: <ARTResource>locationDescr[WidgetDataBinding.location], 
                lat: Number.parseFloat(latNode.getShow()), 
                lng: Number.parseFloat(longNode.getShow())
            }
        } else if (this.data.type == WidgetDataType.route) {
            this.route = this.data.bindingsList.map(routePointDescr => {
                let latNode: ARTNode = routePointDescr[WidgetDataBinding.latitude];
                let longNode: ARTNode = routePointDescr[WidgetDataBinding.longitude];
                return { 
                    location: <ARTResource>routePointDescr[WidgetDataBinding.location], 
                    lat: Number.parseFloat(latNode.getShow()), 
                    lng: Number.parseFloat(longNode.getShow())
                } 
            });
        } else if (this.data.type == WidgetDataType.area) {
            this.area = this.data.bindingsList.map(areaPointDescr => {
                let latNode: ARTNode = areaPointDescr[WidgetDataBinding.latitude];
                let longNode: ARTNode = areaPointDescr[WidgetDataBinding.longitude];
                return { 
                    location: <ARTResource>areaPointDescr[WidgetDataBinding.location], 
                    lat: Number.parseFloat(latNode.getShow()), 
                    lng: Number.parseFloat(longNode.getShow()) 
                } 
            });
        }
    }

    edit() {
        if (this.point) {
            this.openMapModal({ key: "Edit point"}).then(
                (point: GeoPoint) => {
                    let bindingsMap = new Map();
                    bindingsMap.set(WidgetDataBinding.location, this.data.getIdValue());
                    bindingsMap.set(WidgetDataBinding.latitude, new ARTLiteral(point.lat+"", XmlSchema.double.getURI()));
                    bindingsMap.set(WidgetDataBinding.longitude, new ARTLiteral(point.lng+"", XmlSchema.double.getURI()));
                    this.visualizationWidgetsService.updateWidgetData(this.subject, this.predicate, bindingsMap).subscribe(
                        () => {
                            this.update.emit();
                        }
                    )
                },
                () => {}
            );
        } else if (this.route) {
            this.openMapModal({ key: "Edit route"}).then(
                (points: GeoPoint[]) => {
                    console.log("before", this.route);
                    console.log("after", points);
                    //TODO update server side
                },
                () => {}
            );
        } else if (this.area) {
            this.openMapModal({ key: "Edit area"}).then(
                (points: GeoPoint[]) => {
                    console.log("before", this.area);
                    console.log("after", points);
                    //TODO update server side
                },
                () => {}
            );
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