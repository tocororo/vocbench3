import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { CustomOperationDefinition } from "../../../models/CustomService";

export class CustomOperationModalData extends BSModalContext {
    /**
     * @param title 
     * @param operation
     */
    constructor(public operation: CustomOperationDefinition) {
        super();
    }
}

@Component({
    selector: "custom-operation-modal",
    templateUrl: "./customOperationModal.html",
})
export class CustomOperationModal implements ModalComponent<CustomOperationModalData> {
    context: CustomOperationModalData;

    private title: string;

    constructor(public dialog: DialogRef<CustomOperationModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.title = this.context.operation.name;
    }


    ok() {
        this.dialog.close();
    }

    
}