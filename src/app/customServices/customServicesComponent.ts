import { Component } from "@angular/core";
import { Configuration, ConfigurationComponents, Reference } from "../models/Configuration";
import { CustomService, CustomOperation } from "../models/CustomService";
import { ConfigurationsServices } from "../services/configurationsServices";
import { CustomOperationEditor } from "./customOperationEditor";

@Component({
    selector: "custom-services",
    templateUrl: "./customServicesComponent.html",
    host: { class: "pageComponent" },
})
export class CustomServicesComponent {

    private serviceRefs: Reference[];
    private selectedServiceRef: Reference;
    private selectedService: CustomService;

    constructor(private configurationService: ConfigurationsServices) { }

    ngOnInit() {
        this.configurationService.getConfigurationReferences(ConfigurationComponents.CUSTOM_SERVICE_DEFINITION_STORE).subscribe(
            (references: Reference[]) => {
                this.serviceRefs = references;
            }
        );
    }

    private selectService(ref: Reference) {
        if (this.selectedServiceRef != ref) {
            this.selectedServiceRef = ref;
            this.configurationService.getConfiguration(ConfigurationComponents.CUSTOM_SERVICE_DEFINITION_STORE, this.selectedServiceRef.relativeReference).subscribe(
                (conf: Configuration) => {
                    this.selectedService = this.convertConfigurationToCustomService(conf);
                }
            )
        }
    }

    private convertConfigurationToCustomService(conf: Configuration): CustomService {
        let customService: CustomService = new CustomService();
        customService.name = conf.properties.find(p => p.name == "name").value;
        let descriptionProp = conf.properties.find(p => p.name == "description");
        if (descriptionProp != null) {
            customService.description = descriptionProp.value;
        }
        let operationsProp = conf.properties.find(p => p.name == "operations");
        if (operationsProp != null) {
            customService.operations = operationsProp.value;
            customService.operations.sort((o1: CustomOperation, o2: CustomOperation) => o1.name.localeCompare(o2.name));
        }
        return customService;
    }

    private createService() {
        alert("TODO");
    }

    private deleteService() {
        alert("TODO");
    }

}