import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AbstractVectorView, CustomViewRenderedValue, DynamicVectorView, StaticVectorView } from "src/app/models/CustomViews";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { NTriplesUtil } from "src/app/utils/ResourceUtils";

@Component({
    selector: "vector-renderer",
    templateUrl: "./vectorRendererComponent.html",
    styles: [`
        .cv-table {
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 4px;
        }
        .cv-table th { border-top: 0px }
        .cv-table tr { height: 36px }
    `],
})
export class VectorRendererComponent {

    @Input() views: AbstractVectorView[];
    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() readonly: boolean;

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter;
    @Output() update = new EventEmitter();


    headers: string[];

    constructor(private resourcesService: ResourcesServices, private cvService: CustomViewsServices) {
    }

    ngOnInit() {
        this.headers = this.views[0].values.map(v => v.field);

        let resToAnnotate: ARTResource[] = [];
        this.views.forEach(view => {
            view.values.forEach(v => {
                if (v.resource instanceof ARTResource && !resToAnnotate.some(r => r.equals(v.resource))) {
                    resToAnnotate.push(v.resource);
                }
            })
        });
        this.resourcesService.getResourcesInfo(resToAnnotate).subscribe(
            annValues => {
                this.views.forEach(view => {
                    view.values.forEach((v, i, self) => {
                        let annotated = annValues.find(a => a.equals(v.resource));
                        if (annotated != null) {
                            self[i].resource = annotated;
                        }
                    })
                })
            }
        )
    }

    openResource(view: AbstractVectorView) {
        this.doubleClick.emit(view.resource);
    }

    onValueDoubleClick(value: CustomViewRenderedValue) {
        this.doubleClick.emit(value.resource);
    }

    onUpdate(value: CustomViewRenderedValue, data: { old: ARTNode, new: ARTNode }) {

        let updateFn: Observable<void>;

        if (this.views[0] instanceof DynamicVectorView) {
            let pivots: Map<string, ARTNode> = new Map();
            for (let pivotName in value.pivots) {
                pivots.set(pivotName, value.pivots[pivotName]);
            }
            updateFn = this.cvService.updateDynamicVectorData(this.subject, this.predicate, value.field, data.old, data.new, pivots)
        } else if (this.views[0] instanceof StaticVectorView) {
            updateFn = this.cvService.updateStaticVectorData(this.subject, this.predicate, NTriplesUtil.parseURI(value.field), data.old, data.new);
        }
        updateFn.subscribe(
            () => {
                this.update.emit();
            }
        )
        
    }


}