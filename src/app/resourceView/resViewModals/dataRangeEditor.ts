import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral } from "../../models/ARTResources";

@Component({
    selector: "data-range-editor",
    templateUrl: "./dataRangeEditor.html",
})
export class DataRangeEditor {

    @Input() datarange: ARTLiteral[];
    @Output() datarangeChange: EventEmitter<ARTLiteral[]> = new EventEmitter();

    private value: ARTLiteral;

    ngOnInit() {
        if (this.datarange === undefined) {
            this.datarange = [];
        }
    }

    private add() {
        for (var i = 0; i < this.datarange.length; i++) {
            if (this.datarange[i].getValue() == this.value.getValue() && this.datarange[i].getDatatype() == this.value.getDatatype()) {
                return; //datarange already in list => do not add
            }
        }
        this.datarange.push(this.value);
        //emit event to inform the parent that the list is changed
        this.datarangeChange.emit(this.datarange);
    }

    private remove(dr: ARTLiteral) {
        this.datarange.splice(this.datarange.indexOf(dr), 1);
        //emit event to inform the parent that the list is changed
        this.datarangeChange.emit(this.datarange);
    }

}