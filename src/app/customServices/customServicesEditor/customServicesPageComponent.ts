import { Component } from "@angular/core";
import { ModalType } from 'src/app/widget/modal/Modals';
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

    serviceIds: string[];
    selectedServiceId: string;

    createServiceAuthorized: boolean;
    deleteServiceAuthorized: boolean;

    constructor(private customServService: CustomServiceServices, private basicModals: BasicModalServices,
        private customServiceModals: CustomServiceModalServices) { }

    ngOnInit() {
        this.createServiceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.customServiceCreate);
        this.deleteServiceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.customServiceDelete);

        this.initServices();
    }

    initServices() {
        this.customServService.getCustomServiceIdentifiers().subscribe(
            ids => {
                this.serviceIds = ids;
            }
        );
    }

    private selectService(id: string) {
        if (this.selectedServiceId != id) {
            this.selectedServiceId = id;
        }
    }


    createService() {
        this.customServiceModals.openCustomServiceEditor({ key: "CUSTOM_SERVICES.ACTIONS.CREATE_CUSTOM_SERVICE" }).then(
            () => {
                this.initServices();
            },
            () => { }
        );
    }

    deleteService() {
        this.basicModals.confirm({ key: "CUSTOM_SERVICES.ACTIONS.DELETE_CUSTOM_SERVICE" }, { key: "MESSAGES.DELETE_CUSTOM_SERVICE_CONFIRM" }, ModalType.warning).then(
            () => {
                this.customServService.deleteCustomService(this.selectedServiceId).subscribe(
                    () => {
                        this.selectedServiceId = null;
                        this.initServices();
                    }
                );
            }
        );
    }

    reload() {
        this.customServService.reloadCustomServices().subscribe(
            () => {
                this.initServices();
            }
        );
    }

}