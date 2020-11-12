import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomOperationDefinition } from "../../../models/CustomService";

@Component({
    selector: "custom-operation-modal",
    templateUrl: "./customOperationModal.html",
})
export class CustomOperationModal {
    @Input() operation: CustomOperationDefinition;

    title: string;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.title = this.operation.name;
    }

    ok() {
        this.activeModal.close();
    }

    
}