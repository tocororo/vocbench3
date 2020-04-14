import { Component, Input, SimpleChanges } from "@angular/core";
import { CustomOperation, CustomService } from "../models/CustomService";

@Component({
    selector: "custom-service",
    templateUrl: "./customServiceEditor.html",
    host: { class: "vbox" },
    styles: [`
        .entryRow { margin-bottom: 4px; }
        .entryLabel { width: 130px; margin-right: 4px; white-space: nowrap; }
    `]
})
export class CustomServiceEditor {

    @Input() service: CustomService;

    private selectedOperation: CustomOperation;

    constructor() { }

    ngOnChanges(changes: SimpleChanges) {
    }

    private selectOperation(operation: CustomOperation) {
        if (this.selectedOperation != operation) {
            this.selectedOperation = operation;
        }
    }

    private createOperation() {
        alert("TODO");
    }

    private deleteOperation() {
        alert("TODO");
    }

}