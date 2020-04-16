import { Component } from "@angular/core";
import { OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder, Modal } from "ngx-modialog/plugins/bootstrap";
import { Configuration, ConfigurationComponents } from "../models/Configuration";
import { CustomOperation, CustomService } from "../models/CustomService";
import { ConfigurationsServices } from "../services/configurationsServices";
import { CustomServiceServices } from "../services/customServices";
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
    private selectedServiceConf: Configuration;

    constructor(private configurationService: ConfigurationsServices, private customServService: CustomServiceServices, private basicModal: BasicModalServices, private modal: Modal) { }

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
        this.configurationService.getConfiguration(ConfigurationComponents.CUSTOM_SERVICE_DEFINITION_STORE, "sys:" + this.selectedServiceId).subscribe(
            (conf: Configuration) => {
                this.selectedServiceConf = conf;
            }
        )
    }

    private createService() {
        this.openCustomServiceEditor("New Custom Service").then(
            (newService: CustomService) => {
                let config: { [key: string]: any } = {
                    name: newService.name,
                    description: newService.description
                }
                this.customServService.createCustomService(newService.id, config).subscribe(
                    () => {
                        this.initServices();
                    }
                );
            },
            () => {}
        )
    }

    private editService() {
        this.openCustomServiceEditor("Edit Custom Service", this.selectedServiceConf).then(
            (updatedService: CustomService) => {
                //edited => require update
                this.selectedServiceConf.properties.find(p => p.name == "name").value = updatedService.name;
                this.selectedServiceConf.properties.find(p => p.name == "description").value = updatedService.description;
                let config = this.selectedServiceConf.getPropertiesAsMap();
                this.configurationService.storeConfiguration(ConfigurationComponents.CUSTOM_SERVICE_DEFINITION_STORE, "sys:" + this.selectedServiceId, config).subscribe(
                    () => {
                        this.customServService.reloadCustomService(this.selectedServiceId).subscribe(
                            () => {
                                this.initServices();
                            }
                        )
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

    private openCustomServiceEditor(title: string, serviceConf?: Configuration) {
        let customService: CustomService;
        if (serviceConf != null) {
            customService = { 
                id: this.selectedServiceId,
                name: serviceConf.properties.find(p => p.name == "name").value,
                description: serviceConf.properties.find(p => p.name == "description").value
            }
        }
        let modalData = new CustomServiceEditorModalData(title, customService);
        const builder = new BSModalContextBuilder<CustomServiceEditorModalData>(
            modalData, undefined, CustomServiceEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CustomServiceEditorModal, overlayConfig).result;
    }

}