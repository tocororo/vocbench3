import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../../../models/ARTResources";

@Component({
    selector: "filter-graphs-modal",
    templateUrl: "./filterGraphsModal.html",
})
export class FilterGraphsModal {
    @Input() graphs: {checked: boolean, graph: ARTURIResource}[];


    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {}

    // graph panel handlers
    areAllGraphDeselected(): boolean {
        for (var i = 0; i < this.graphs.length; i++) {
            if (this.graphs[i].checked) {
                return false;
            }
        }
        return true;
    }


    ok() {
        this.activeModal.close();
    }

}