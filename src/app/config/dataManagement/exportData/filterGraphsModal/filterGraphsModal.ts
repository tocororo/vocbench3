import { Component } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { PluginConfiguration } from "../../../../models/Plugins";
import { ARTURIResource } from "../../../../models/ARTResources";

export class FilterGraphsModalData extends BSModalContext {
    /**
     * @param configuration 
     */
    constructor(public graphs: {checked: boolean, graph: ARTURIResource}[]) {
        super();
    }
}

@Component({
    selector: "filter-graphs-modal",
    templateUrl: "./filterGraphsModal.html",
})
export class FilterGraphsModal implements ModalComponent<FilterGraphsModalData> {
    context: FilterGraphsModalData;


    constructor(public dialog: DialogRef<FilterGraphsModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {}

    // graph panel handlers
    private areAllGraphDeselected(): boolean {
        for (var i = 0; i < this.context.graphs.length; i++) {
            if (this.context.graphs[i].checked) {
                return false;
            }
        }
        return true;
    }


    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}