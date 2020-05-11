import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { CustomOperationDefinition, CustomService, CustomServiceDefinition } from "../../../models/CustomService";
import { CustomServiceServices } from "../../../services/customServiceServices";

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

    constructor(public dialog: DialogRef<CustomServiceEditorModalData>, private customServService: CustomServiceServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.service != null) { // edit mode
            this.id = this.context.service.id;
            this.name = this.context.service.getPropertyValue("name");
            this.description = this.context.service.getPropertyValue("description");
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
            let pristineName: string = this.context.service.getPropertyValue("name");
            let pristineDescription: string = this.context.service.getPropertyValue("description");
            if (pristineName != this.name || pristineDescription != this.description) {
                let operations: CustomOperationDefinition[] = this.context.service.getPropertyValue("operations");
                let updatedService: CustomServiceDefinition = { name: this.name, description: this.description, operations: operations };
                this.customServService.updateCustomService(this.context.service.id, updatedService).subscribe(
                    () => {
                        this.dialog.close();
                    }
                );
            } else { //nothing's changed => cancel, so the calling component doesn't update
                this.cancel();
            }
        } else { //create
            let newService: CustomServiceDefinition = { name: this.name, description: this.description };
            this.customServService.createCustomService(this.id.trim(), newService).subscribe(
                () => {
                    this.dialog.close();
                }
            );
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}