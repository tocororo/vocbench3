import { Component } from "@angular/core";
import { CustomServiceServices } from "../../services/customServiceServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CustomServiceModalServices } from "./modals/customServiceModalServices";

@Component({
    selector: "custom-services-component",
    templateUrl: "./customServicesPageComponent.html",
    host: { class: "hbox" },
})
export class CustomServicesPageComponent {

    private serviceIds: string[];
    private selectedServiceId: string;

    private createServiceAuthorized: boolean;
    private deleteServiceAuthorized: boolean;

    constructor(private customServService: CustomServiceServices, private basicModals: BasicModalServices, 
        private customServiceModals: CustomServiceModalServices) { }

    ngOnInit() {
        this.createServiceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.customServiceCreate);
        this.deleteServiceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.customServiceDelete);

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
        this.basicModals.confirm("Delete CustomService", "You are deleting CustomService '" + this.selectedServiceId + "'. Are you sure?", "warning").then(
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

    private reload() {
        this.customServService.reloadCustomServices().subscribe(
            () => {
                this.initServices();
            }
        )
    }

}