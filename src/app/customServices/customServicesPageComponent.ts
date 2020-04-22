import { Component } from "@angular/core";
import { CustomServiceServices } from "../services/customServiceServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { CustomServiceModalServices } from "./modals/customServiceModalServices";

@Component({
    selector: "custom-services-component",
    templateUrl: "./customServicesPageComponent.html",
    host: { class: "pageComponent" },
})
export class CustomServicesComponent {

    private serviceIds: string[];
    private selectedServiceId: string;

    constructor(private customServService: CustomServiceServices, private basicModal: BasicModalServices, 
        private customServiceModals: CustomServiceModalServices) { }

    ngOnInit() {
        this.initServices();
    }

    private initServices() {
        this.customServService.getCustomServiceIdentifiers().subscribe(
            ids => {
                this.serviceIds = ids;
            }
        )
    }

    private selectService(id: string) {
        if (this.selectedServiceId != id) {
            this.selectedServiceId = id;
        }
    }


    private createService() {
        this.customServiceModals.openCustomServiceEditor("New Custom Service").then(
            () => {
                this.initServices();
            },
            () => {}
        )
    }

    private deleteService() {
        this.basicModal.confirm("Delete CustomService", "You are deleting CustomService '" + this.selectedServiceId + "'. Are you sure?", "warning").then(
            () => {
                this.customServService.deleteCustomService(this.selectedServiceId).subscribe(
                    () => {
                        this.selectedServiceId = null;
                        this.initServices();
                    }
                )
            }
        )
    }

}