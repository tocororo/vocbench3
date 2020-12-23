import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { RemoteAlignmentServiceConfiguration, RemoteAlignmentServiceConfigurationDef } from "../../../models/Alignment";
import { RemoteAlignmentServices } from "../../../services/remoteAlignmentServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "remote-system-config-admin-modal",
    templateUrl: "./remoteSystemConfigurationsAdministration.html",
})
export class RemoteSystemConfigurationsAdministration {

    savedConfigs: RemoteAlignmentServiceConfigurationDef[];
    private defaultConfig: RemoteAlignmentServiceConfigurationDef;

    newConfig: NewRemoteAlignmentServiceConfigurationDef = new NewRemoteAlignmentServiceConfigurationDef();

    constructor(public activeModal: NgbActiveModal, private remoteAlignmentService: RemoteAlignmentServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
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

                //init the default configuration
                this.remoteAlignmentService.getDefaultRemoteAlignmentServiceId().subscribe(
                    id => {
                        this.defaultConfig = this.savedConfigs.find(c => c.id == id);
                    }
                )
            }
        );
    }

    createConfig() {
        //add the new configuration only if another config with the same ID doesn't exist
        if (this.savedConfigs.some(c => c.id == this.newConfig.id)) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.ALREADY_EXISTING_CONFIG_ID"}, ModalType.warning);
            return;
        }
        this.remoteAlignmentService.addRemoteAlignmentService(this.newConfig.id, this.newConfig.serverURL, this.newConfig.username, this.newConfig.password, this.newConfig['default']).subscribe(
            () => {
                this.newConfig = new NewRemoteAlignmentServiceConfigurationDef(); //reset the new config
                this.initConfigs();
            }
        );
    }

    deleteConfig(config: RemoteAlignmentServiceConfigurationDef) {
        this.basicModals.confirm({key:"ACTIONS.DELETE_CONFIGURATION"}, {key:"MESSAGES.DELETE_REMOTE_ALIGN_SYS_CONFIG_CONFIRM", params:{config: config.id}}, ModalType.warning).then(
            () => {
                this.remoteAlignmentService.deleteRemoteAlignmentService(config.id).subscribe(
                    () => {
                        this.initConfigs();
                    }
                )
            },
            () => {}
        );
    }

    setDefaultConfig(config: RemoteAlignmentServiceConfigurationDef) {
        this.defaultConfig = config;
        this.updateConfig(this.defaultConfig, true);
    }
    updateConfServerURL(config: RemoteAlignmentServiceConfigurationDef, serverURL: string) {
        config.serverURL = serverURL;
        this.updateConfig(config)
    }
    updateConfUsername(config: RemoteAlignmentServiceConfigurationDef, username: string) {
        config.username = username;
        this.updateConfig(config)
    }
    updateConfPassword(config: RemoteAlignmentServiceConfigurationDef, password: string) {
        config.password = password;
        this.updateConfig(config)
    }
    private updateConfig(config: RemoteAlignmentServiceConfigurationDef, asDefault?: boolean) {
        this.remoteAlignmentService.updateRemoteAlignmentService(config.id, config.serverURL, config.username, config.password, asDefault).subscribe();
    }


    ok() {
        this.activeModal.close();
    }

}

class NewRemoteAlignmentServiceConfigurationDef extends RemoteAlignmentServiceConfigurationDef {
    default?: boolean;
}