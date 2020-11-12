import { Component } from "@angular/core";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { RemoteAlignmentServiceConfiguration, RemoteAlignmentServiceConfigurationDef } from "../../../models/Alignment";
import { Pair } from "../../../models/Shared";
import { RemoteAlignmentServices } from "../../../services/remoteAlignmentServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { RemoteSystemConfigurationsAdministration } from "./remoteSystemConfigurationsAdministration";

@Component({
    selector: "remote-system-settings-modal",
    templateUrl: "./remoteSystemSettingsModal.html",
})
export class RemoteSystemSettingsModal {

    isAdmin: boolean;
    isSetServiceAuthorized: boolean;
    isRemoveServiceAuthorized: boolean;

    savedConfigs: RemoteAlignmentServiceConfigurationDef[];
    private activeConfig: RemoteAlignmentServiceConfigurationDef;

    private changed: boolean = false;

    constructor(public activeModal: NgbActiveModal, private remoteAlignmentService: RemoteAlignmentServices, private modalService: NgbModal) {}

    ngOnInit() {
        this.isAdmin = VBContext.getLoggedUser().isAdmin();
        this.isSetServiceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.remoteAlignmentServiceSet);
        this.isRemoveServiceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.remoteAlignmentServiceRemove);

        this.initConfigs();
    }

    initConfigs() {
        //initialize the available configurations
        this.remoteAlignmentService.getRemoteAlignmentServices().subscribe(
            services => {
                this.savedConfigs = [];
                for (let id in services) {
                    let servConf: RemoteAlignmentServiceConfiguration = services[id];
                    let servConfDef: RemoteAlignmentServiceConfigurationDef = {
                        id: id,
                        serverURL: servConf.getPropertyValue("serverURL"),
                        username: servConf.getPropertyValue("username"),
                        password: servConf.getPropertyValue("password")
                    }
                    this.savedConfigs.push(servConfDef);
                }
                this.savedConfigs.sort((c1, c2) => c1.id.localeCompare(c2.id));
                //initialize the active configuration
                this.remoteAlignmentService.getAlignmentServiceForProject().subscribe(
                    (pair: Pair<string, boolean>) => {
                        this.activeConfig = null;
                        if (pair != null) {
                            let confId: string = pair.first;
                            let explicit: boolean = pair.second;
                            this.activeConfig = this.savedConfigs.find(c => c.id == confId);
                            if (this.activeConfig == null) {
                                //the stored alignment service for the current project has been probably deleted => remove it
                                this.remoteAlignmentService.removeAlignmentServiceForProject().subscribe();
                            }
                        }
                    }
                );
            }
        );
    }

    activateConfig(config: RemoteAlignmentServiceConfigurationDef) {
        this.activeConfig = config;
        this.remoteAlignmentService.setAlignmentServiceForProject(this.activeConfig.id).subscribe(
            () => {
                this.changed = true;
            }
        );
    }

    administration() {
        this.modalService.open(RemoteSystemConfigurationsAdministration, new ModalOptions('lg')).result.then(
            () => {
                this.changed = true;
                this.initConfigs();
            }
        )
    }


    ok() {
        this.activeModal.close(this.changed);
    }

}