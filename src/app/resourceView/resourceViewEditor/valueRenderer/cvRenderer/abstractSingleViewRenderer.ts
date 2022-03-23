import { Directive, Input } from "@angular/core";
import { ARTNode } from "src/app/models/ARTResources";
import { AbstractView } from "src/app/models/CustomViews";
import { AbstractViewRendererComponent } from "./abstractViewRenderer";

@Directive()
export abstract class AbstractSingleViewRendererComponent extends AbstractViewRendererComponent {

    @Input() view: AbstractView;

    ngOnInit() {
        super.ngOnInit();
    }


    deleteHandler() {
        this.delete.emit(this.view.resource);
    }

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