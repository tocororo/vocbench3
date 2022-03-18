import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AbstractVectorView, CustomViewRenderedValue } from "src/app/models/CustomViews";
import { ResourcesServices } from "src/app/services/resourcesServices";

@Component({
    selector: "cv-table-renderer",
    templateUrl: "./cvTableRendererComponent.html",
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
export class CvTableRendererComponent {

    @Input() views: AbstractVectorView[];
    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() readonly: boolean;

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter;
    @Output() update = new EventEmitter();


    headers: string[];

    constructor(private resourcesService: ResourcesServices) {
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

    onUpdate() {
        this.update.emit();
    }


}