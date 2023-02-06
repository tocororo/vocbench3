import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomOperationDefinition, CustomService, CustomServiceDefinition } from "../../../models/CustomService";
import { CustomServiceServices } from "../../../services/customServiceServices";

@Component({
    selector: "custom-service-editor-modal",
    templateUrl: "./customServiceEditorModal.html",
})
export class CustomServiceEditorModal {
    @Input() title: string;
    @Input() service: CustomService;

    private readonly ID_PATH: string = "it.uniroma2.art.semanticturkey.customservice";
    name: string;
    description: string;

    constructor(public activeModal: NgbActiveModal, private customServService: CustomServiceServices) { }

    ngOnInit() {
        if (this.service != null) { // edit mode
            this.name = this.service.getPropertyValue("name");
            this.description = this.service.getPropertyValue("description");
        }
    }

    isDataValid(): boolean {
        return this.name && this.name.trim() != "";
    }

    ok() {
        if (!this.isDataValid()) {
            return;
        }

        if (this.service) { //edit
            //check if something changed
            let pristineName: string = this.service.getPropertyValue("name");
            let pristineDescription: string = this.service.getPropertyValue("description");
            if (pristineName != this.name || pristineDescription != this.description) {
                let operations: CustomOperationDefinition[] = this.service.getPropertyValue("operations");
                let updatedService: CustomServiceDefinition = { name: this.name, description: this.description, operations: operations };
                this.customServService.updateCustomService(this.service.id, updatedService).subscribe(
                    () => {
                        this.activeModal.close();
                    }
                );
            } else { //nothing's changed => cancel, so the calling component doesn't update
                this.cancel();
            }
        } else { //create
            let newService: CustomServiceDefinition = { name: this.name, description: this.description };
            let id: string = this.ID_PATH + "." + this.name;
            this.customServService.createCustomService(id, newService).subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}