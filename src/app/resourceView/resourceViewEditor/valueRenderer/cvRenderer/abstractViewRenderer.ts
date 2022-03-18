import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { AbstractView } from "src/app/models/CustomViews";
import { ResourcesServices } from "src/app/services/resourcesServices";

@Directive()
export abstract class AbstractViewRendererComponent {
    @Input() view: AbstractView;
    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() readonly: boolean;

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter;
    @Output() update = new EventEmitter();

    editAuthorized: boolean = true;

    /**
     * normalizes the input data in a format compliant for the view renderer
     */
    protected abstract processInput(): void;

    constructor() {}

    /**
     * Emit a doubleClick event on the resource described in the CV (unless otherwise specified, e.g. a single data of a chart)
     * @param res 
     */
    onDoubleClick(res?: ARTNode) {
        if (res == null) { 
            res = this.view.resource;
        }
        this.doubleClick.emit(res);
    }

}