import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode } from "src/app/models/ARTResources";
import { AbstractView } from "src/app/models/CustomViews";

@Directive()
export abstract class AbstractViewRendererComponent {
    @Input() view: AbstractView;
    @Input() readonly: boolean;

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter;

    editAuthorized: boolean = true;

    /**
     * normalizes the input data in a format compliant for the view renderer
     */
    protected abstract processInput(): void;

    onDoubleClick(res: ARTNode) {
        if (res == null) { 
            //doubleClick provide a null entity when user double click on empty area of chart (pie/bar/line),
            //in this case the resource to expand is the ID element of the widget
            res = this.view.getIdResource();
        }
        this.doubleClick.emit(res);
    }

}