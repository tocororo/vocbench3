import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AbstractView, AreaView, CustomViewCategory, PointView, RouteView, SeriesCollectionView, SeriesView } from "src/app/models/CustomViews";

@Component({
    selector: "custom-view-renderer",
    templateUrl: "./customViewRenderer.html",
    host: { class: "hbox" },
    styles: [`
        :host {
            padding: 3px;
            height: 300px;
        }
    `]
})
export class CustomViewRenderer {

    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() view: AbstractView;
    @Input() rendering: boolean;
    @Input() readonly: boolean;

    @Output() update = new EventEmitter(); //a change has been done => request to update the RV
    @Output() doubleClick: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    activeViewRenderer: CustomViewCategory;

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['view']) {
            this.init();
        }
    }

    private init() {
        if (this.view instanceof AreaView || this.view instanceof RouteView || this.view instanceof PointView) {
            this.activeViewRenderer = CustomViewCategory.geospatial;
        } else if (this.view instanceof SeriesView || this.view instanceof SeriesCollectionView) {
            this.activeViewRenderer = CustomViewCategory.statistical_series;
        }
        // else if (this view instanceof )
        
    }

    onUpdate() {
        this.update.emit();
    }

    onDoubleClick(res: ARTResource) {
        this.doubleClick.emit(res);
    }


}