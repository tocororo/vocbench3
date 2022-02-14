import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UIUtils } from "src/app/utils/UIUtils";
import { GeoPoint } from "./leafletMapComponent";

@Component({
    selector: "leaflet-map-modal",
    templateUrl: "./leafletMapModal.html",
})
export class LeafletMapModal {
    @Input() title: string;
    @Input() selection: boolean;
    
    @Input() point: GeoPoint;
    @Input() trace: GeoPoint[];

    viewInitialized: boolean;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

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

    onPointSelected(point: GeoPoint) {
        this.point = point;
    }

    isOkEnabled(): boolean {
        return !this.selection || (this.point != null || this.trace != null); //ok enabled in any case if modal is not working in selection mode, if a point or a trace is selected otherwise 
    }

    ok() {
        if (this.point) {
            this.activeModal.close(this.point);
        } else {
            this.activeModal.close(this.trace);
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}