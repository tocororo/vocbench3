import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTURIResource, ARTLiteral } from "../../models/ARTResources";
import { XmlSchema } from "../../models/Vocabulary";

@Component({
    selector: "data-range-editor",
    templateUrl: "./dataRangeEditor.html",
})
export class DataRangeEditor {

    @Input() datarange: ARTLiteral[];
    @Output() datarangeChange: EventEmitter<ARTLiteral[]> = new EventEmitter();

    private value: string;
    private datatype: ARTURIResource;

    ngOnInit() {
        console.log("data range editor", this.datarange);
        console.log("data range editor 1");
        if (this.datarange === undefined) {
            this.datarange = [];
        }
        console.log("data range editor 2");
    }

    ngAfterViewInit() {
        console.log("data range editor 3");
    }

    private onDatatypeChange(dt: ARTURIResource) {
        console.log("data range editor 4");
        this.datatype = dt;
    }

    private add() {
        for (var i = 0; i < this.datarange.length; i++) {
            if (this.datarange[i].getValue() == this.value && this.datarange[i].getDatatype() == this.datatype.getURI()) {
                return; //datarange already in list => do not add
            }
        }
        this.datarange.push(new ARTLiteral(this.value, this.datatype.getURI()));
        this.value = null;
        //emit event to inform the parent that the list is changed
        this.datarangeChange.emit(this.datarange);
    }

    private remove(dr: ARTLiteral) {
        this.datarange.splice(this.datarange.indexOf(dr), 1);
        //emit event to inform the parent that the list is changed
        this.datarangeChange.emit(this.datarange);
    }

}