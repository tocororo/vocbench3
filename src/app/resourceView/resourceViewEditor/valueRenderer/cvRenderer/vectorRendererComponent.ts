import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { ARTNode, ARTResource } from "src/app/models/ARTResources";
import { AbstractVectorView, CustomViewRenderedValue, DynamicVectorView, StaticVectorView } from "src/app/models/CustomViews";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { NTriplesUtil } from "src/app/utils/ResourceUtils";
import { AbstractViewRendererComponent } from "./abstractViewRenderer";

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
export class VectorRendererComponent extends AbstractViewRendererComponent {

    @Input() views: AbstractVectorView[];

    headers: string[];

    constructor(private resourcesService: ResourcesServices, private cvService: CustomViewsServices) {
        super();
    }

    ngOnInit() {
        this.headers = this.views[0].values.map(v => v.field);

        let resToAnnotate: ARTResource[] = [];
        this.views.forEach(view => {
            view.values.forEach(v => {
                if (v.resource instanceof ARTResource && !resToAnnotate.some(r => r.equals(v.resource))) {
                    resToAnnotate.push(v.resource);
                }
            });
        });

        //headers might be both human readable string (if label is provided in dynamic vector) or a NT-serialized propery, in this case, annotate them as well
        this.headers.forEach(h => {
            try {
                let hIri = NTriplesUtil.parseURI(h);
                resToAnnotate.push(hIri);
            } catch {}
        });

        if (resToAnnotate.length > 0) {
            this.resourcesService.getResourcesInfo(resToAnnotate).subscribe(
                annValues => {
                    this.headers.forEach((h, i, self) => {
                        let annotated = annValues.find(a => a.toNT() == h);
                        if (annotated != null) {
                            self[i] = annotated.getShow();
                        }
                    });
                    this.views.forEach(view => {
                        view.values.forEach((v, i, self) => {
                            let annotated = annValues.find(a => a.equals(v.resource));
                            if (annotated != null) {
                                self[i].resource = annotated;
                            }
                        });
                    });
                }
            );
        }
    }

    processInput() {
        //Nothing to do
    }

    openResource(view: AbstractVectorView) {
        this.doubleClick.emit(view.resource);
    }

    onValueDoubleClick(value: CustomViewRenderedValue) {
        this.doubleClick.emit(value.resource);
    }

    deleteHandler(view: AbstractVectorView) {
        this.delete.emit(view.resource);
    }

    onUpdate(value: CustomViewRenderedValue, data: { old: ARTNode, new: ARTNode }) {
        let updateFn: Observable<void>;

        if (this.views[0] instanceof DynamicVectorView) {
            let pivots: Map<string, ARTNode> = new Map();
            for (let pivotName in value.pivots) {
                pivots.set(pivotName, value.pivots[pivotName]);
            }
            updateFn = this.cvService.updateDynamicVectorData(this.subject, this.predicate, value.field, data.old, data.new, pivots);
        } else if (this.views[0] instanceof StaticVectorView) {
            updateFn = this.cvService.updateStaticVectorData(this.subject, this.predicate, NTriplesUtil.parseURI(value.field), data.old, data.new);
        }
        updateFn.subscribe(
            () => {
                this.update.emit();
            }
        );
    }


}