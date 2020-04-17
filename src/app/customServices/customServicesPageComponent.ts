import { Component } from "@angular/core";
import { OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder, Modal } from "ngx-modialog/plugins/bootstrap";
import { CustomService, CustomServiceDefinition, CustomOperationTypes, CustomOperation, CustomOperationDefinition } from "../models/CustomService";
import { CustomServiceServices } from "../services/customServiceServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { CustomServiceEditorModal, CustomServiceEditorModalData } from "./modals/customServiceEditorModal";

@Component({
    selector: "custom-services-component",
    templateUrl: "./customServicesPageComponent.html",
    host: { class: "pageComponent" },
})
export class CustomServicesComponent {

    private serviceIds: string[];
    private selectedServiceId: string;
    private selectedService: CustomService;

    constructor(private customServService: CustomServiceServices, private basicModal: BasicModalServices, private modal: Modal) { }

    ngOnInit() {
        this.initServices();
    }

    private initServices() {
        this.customServService.getCustomServiceIdentifiers().subscribe(
            ids => {
                this.serviceIds = ids;
                if (this.selectedServiceId != null) { //if there was a selected service, restore the selection
                    this.initServiceConfiguration();
                }
            }
        )
    }

    private selectService(id: string) {
        if (this.selectedServiceId != id) {
            this.selectedServiceId = id;
            this.initServiceConfiguration();
        }
    }

    private initServiceConfiguration() {
        this.customServService.getCustomService(this.selectedServiceId).subscribe(
            (conf: CustomService) => {
                let operations: CustomOperationDefinition[] = conf.getPropertyValue("operations");
                if (operations != null) {
                    operations.sort((o1, o2) => o1.name.localeCompare(o2.name));
                }
                this.selectedService = conf;
            }
        )
    }

    private createService() {
        this.openCustomServiceEditor("New Custom Service").then(
            (newService: CustomServiceDefinition) => {
                this.customServService.createCustomService(newService.id, newService).subscribe(
                    () => {
                        this.initServices();
                    }
                );
            },
            () => {}
        )
    }

    private editService() {
        this.openCustomServiceEditor("Edit Custom Service", this.selectedService).then(
            (updatedService: CustomServiceDefinition) => {
                //edited => require update
                this.selectedService.properties.find(p => p.name == "name").value = updatedService.name;
                this.selectedService.properties.find(p => p.name == "description").value = updatedService.description;
                let config = this.selectedService.getPropertiesAsMap();
                this.customServService.updateCustomService(this.selectedServiceId, config).subscribe(
                    () => {
                        this.initServices();
                    }
                )
            },
            () => {}
        );
    }

    private deleteService() {
        this.basicModal.confirm("Delete CustomService", "You are deleting CustomService '" + this.selectedServiceId + "'. Are you sure?", "warning").then(
            () => {
                this.customServService.deleteCustomService(this.selectedServiceId).subscribe(
                    () => {
                        this.initServices();
                    }
                )
            }
        )
    }

    /**
     * When in the custom-service component a change is made, re-init the service.
     */
    private onServiceUpdate() {
        this.initServiceConfiguration();
    }

    private openCustomServiceEditor(title: string, serviceConf?: CustomService): Promise<CustomServiceDefinition> {
        let editedConfId: string;
        if (serviceConf != null) {
            editedConfId = this.selectedServiceId;
        }
        let modalData = new CustomServiceEditorModalData(title, serviceConf);
        const builder = new BSModalContextBuilder<CustomServiceEditorModalData>(
            modalData, undefined, CustomServiceEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CustomServiceEditorModal, overlayConfig).result;
    }

}