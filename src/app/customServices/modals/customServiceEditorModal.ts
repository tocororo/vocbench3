import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { CustomService } from "../../models/CustomService";
import { Reference } from "../../models/Configuration";

export class CustomServiceEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public service?: CustomService) {
        super();
    }
}

@Component({
    selector: "custom-service-editor-modal",
    templateUrl: "./customServiceEditorModal.html",
})
export class CustomServiceEditorModal implements ModalComponent<CustomServiceEditorModalData> {
    context: CustomServiceEditorModalData;

    private id: string;
    private name: string;
    private description: string;

    constructor(public dialog: DialogRef<CustomServiceEditorModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.service != null) { // edit mode
            this.id = this.context.service.id;
            this.name = this.context.service.name;
            this.description = this.context.service.description;
        }
    }

    private isDataValid(): boolean {
        //valid if both id and name are provided
        return this.id && this.id.trim() != "" && this.name && this.name.trim() != "";
    }

    ok() {
        if (!this.isDataValid()) {
            return;
        }

        if (this.context.service) { //edit
            //check if something changed
            if (this.context.service.name != this.name || this.context.service.description != this.description) {
                let updatedService: CustomService = { name: this.name, description: this.description, id: this.context.service.id };
                this.dialog.close(updatedService);
            } else {
                this.cancel();
            }
        } else { //create
            let newService: CustomService = { name: this.name, description: this.description, id: this.id.trim() };
            this.dialog.close(newService);
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}